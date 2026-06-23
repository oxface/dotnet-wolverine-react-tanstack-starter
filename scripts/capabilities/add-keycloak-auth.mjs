#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "../..");

async function read(relative) {
  return await readFile(path.join(root, relative), "utf8");
}

async function write(relative, text) {
  await mkdir(path.dirname(path.join(root, relative)), { recursive: true });
  await writeFile(path.join(root, relative), text);
}

function insertBefore(text, needle, insertion) {
  if (text.includes(insertion.trim())) {
    return text;
  }

  const index = text.indexOf(needle);
  if (index === -1) {
    throw new Error(`Could not find insertion point: ${needle}`);
  }

  return `${text.slice(0, index)}${insertion}${text.slice(index)}`;
}

function insertAfter(text, needle, insertion) {
  if (text.includes(insertion.trim())) {
    return text;
  }

  const index = text.indexOf(needle);
  if (index === -1) {
    throw new Error(`Could not find insertion point: ${needle}`);
  }

  const end = index + needle.length;
  return `${text.slice(0, end)}${insertion}${text.slice(end)}`;
}

function replaceOnce(text, from, to) {
  if (text.includes(to.trim())) {
    return text;
  }

  if (!text.includes(from)) {
    throw new Error(`Could not find text to replace: ${from}`);
  }

  return text.replace(from, to);
}

async function update(relative, transform) {
  const original = await read(relative);
  const next = transform(original);
  if (next !== original) {
    await write(relative, next);
  }
}

const authFiles = new Map([
  [
    "server/src/StarterKit.Api/Auth/AuthEndpoints.cs",
    `using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.OpenIdConnect;

namespace StarterKit.Api.Auth;

public static class AuthEndpoints
{
    public static IEndpointRouteBuilder MapAuthEndpoints(this IEndpointRouteBuilder endpoints)
    {
        RouteGroupBuilder group = endpoints.MapGroup("/api/auth");

        group.MapGet("/me", (ClaimsPrincipal user) =>
            Results.Ok(new CurrentUserResponse(
                user.Identity?.IsAuthenticated == true,
                user.Identity?.Name,
                user.Claims
                    .Select(claim => new CurrentUserClaim(claim.Type, claim.Value))
                    .ToArray())));

        group.MapGet("/login", (string? returnUrl) =>
            Results.Challenge(
                new AuthenticationProperties
                {
                    RedirectUri = string.IsNullOrWhiteSpace(returnUrl) ? "/" : returnUrl,
                },
                [OpenIdConnectDefaults.AuthenticationScheme]));

        group.MapPost("/logout", () =>
            Results.SignOut(
                new AuthenticationProperties { RedirectUri = "/" },
                [
                    CookieAuthenticationDefaults.AuthenticationScheme,
                    OpenIdConnectDefaults.AuthenticationScheme,
                ]));

        return endpoints;
    }
}

public sealed record CurrentUserResponse(
    bool IsAuthenticated,
    string? Name,
    IReadOnlyCollection<CurrentUserClaim> Claims);

public sealed record CurrentUserClaim(string Type, string Value);
`,
  ],
  [
    "server/src/StarterKit.Api/Auth/AuthServiceCollectionExtensions.cs",
    `using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.OpenIdConnect;
using Microsoft.IdentityModel.Protocols.OpenIdConnect;
using Microsoft.Extensions.Options;

namespace StarterKit.Api.Auth;

public static class AuthServiceCollectionExtensions
{
    public static IServiceCollection AddKeycloakCookieAuth(
        this IServiceCollection services,
        IConfiguration configuration,
        IHostEnvironment environment)
    {
        string ticketConnectionString = configuration.GetConnectionString("session-tickets")
            ?? "localhost:6380";

        services.AddStackExchangeRedisCache(options =>
        {
            options.Configuration = ticketConnectionString;
            options.InstanceName = "StarterKit:AuthTickets:";
        });

        services.AddSingleton<RedisTicketStore>();
        services.AddSingleton<IPostConfigureOptions<CookieAuthenticationOptions>, ConfigureCookieTicketStore>();

        bool isDevelopment = environment.IsDevelopment();

        services
            .AddAuthentication(options =>
            {
                options.DefaultScheme = CookieAuthenticationDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = OpenIdConnectDefaults.AuthenticationScheme;
            })
            .AddCookie(options =>
            {
                options.Cookie.Name = "__Host-StarterKit";
                options.Cookie.HttpOnly = true;
                options.Cookie.SameSite = SameSiteMode.Lax;
                options.Cookie.SecurePolicy = isDevelopment
                    ? CookieSecurePolicy.SameAsRequest
                    : CookieSecurePolicy.Always;
                options.SlidingExpiration = true;
            })
            .AddOpenIdConnect(options =>
            {
                options.Authority = configuration["Authentication:Keycloak:Authority"]
                    ?? "http://localhost:8080/realms/starter-kit";
                options.ClientId = configuration["Authentication:Keycloak:ClientId"]
                    ?? "starter-kit-web";

                string? clientSecret = configuration["Authentication:Keycloak:ClientSecret"];
                if (!string.IsNullOrWhiteSpace(clientSecret))
                {
                    options.ClientSecret = clientSecret;
                }

                options.ResponseType = OpenIdConnectResponseType.Code;
                options.SaveTokens = true;
                options.GetClaimsFromUserInfoEndpoint = true;
                options.RequireHttpsMetadata = !isDevelopment;
                options.CallbackPath = "/signin-oidc";
                options.SignedOutCallbackPath = "/signout-callback-oidc";
                options.MapInboundClaims = false;
                options.TokenValidationParameters.NameClaimType = "preferred_username";
                options.TokenValidationParameters.RoleClaimType = "roles";

                options.Scope.Clear();
                options.Scope.Add("openid");
                options.Scope.Add("profile");
                options.Scope.Add("email");
            });

        services.AddAuthorization();

        return services;
    }
}
`,
  ],
  [
    "server/src/StarterKit.Api/Auth/ConfigureCookieTicketStore.cs",
    `using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.Extensions.Options;

namespace StarterKit.Api.Auth;

public sealed class ConfigureCookieTicketStore(RedisTicketStore ticketStore)
    : IPostConfigureOptions<CookieAuthenticationOptions>
{
    public void PostConfigure(string? name, CookieAuthenticationOptions options)
    {
        if (name == CookieAuthenticationDefaults.AuthenticationScheme)
        {
            options.SessionStore = ticketStore;
        }
    }
}
`,
  ],
  [
    "server/src/StarterKit.Api/Auth/RedisTicketStore.cs",
    `using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.Extensions.Caching.Distributed;

namespace StarterKit.Api.Auth;

public sealed class RedisTicketStore(IDistributedCache cache) : ITicketStore
{
    private static readonly TimeSpan SlidingExpiration = TimeSpan.FromHours(8);
    private static readonly TimeSpan AbsoluteExpirationRelativeToNow = TimeSpan.FromDays(14);

    public async Task<string> StoreAsync(AuthenticationTicket ticket)
    {
        string key = $"ticket:{Guid.NewGuid():N}";
        await RenewAsync(key, ticket);
        return key;
    }

    public async Task RenewAsync(string key, AuthenticationTicket ticket)
    {
        byte[] bytes = TicketSerializer.Default.Serialize(ticket);
        await cache.SetAsync(
            key,
            bytes,
            new DistributedCacheEntryOptions
            {
                SlidingExpiration = SlidingExpiration,
                AbsoluteExpirationRelativeToNow = AbsoluteExpirationRelativeToNow,
            });
    }

    public async Task<AuthenticationTicket?> RetrieveAsync(string key)
    {
        byte[]? bytes = await cache.GetAsync(key);
        return bytes is null ? null : TicketSerializer.Default.Deserialize(bytes);
    }

    public Task RemoveAsync(string key) => cache.RemoveAsync(key);
}
`,
  ],
]);

await update("Directory.Packages.props", (text) => {
  text = insertBefore(
    text,
    '    <PackageVersion Include="Microsoft.AspNetCore.Mvc.Testing" Version="10.0.9" />',
    '    <PackageVersion Include="Microsoft.AspNetCore.Authentication.OpenIdConnect" Version="10.0.9" />\n',
  );
  text = insertBefore(
    text,
    '    <PackageVersion Include="Microsoft.Extensions.Http.Resilience" Version="10.6.0" />',
    '    <PackageVersion Include="Microsoft.Extensions.Caching.StackExchangeRedis" Version="10.0.9" />\n',
  );
  return text;
});

await update("server/src/StarterKit.Api/StarterKit.Api.csproj", (text) => {
  text = insertBefore(
    text,
    '    <PackageReference Include="Microsoft.AspNetCore.OpenApi" />',
    '    <PackageReference Include="Microsoft.AspNetCore.Authentication.OpenIdConnect" />\n',
  );
  text = insertAfter(
    text,
    '    <PackageReference Include="Microsoft.AspNetCore.OpenApi" />',
    '\n    <PackageReference Include="Microsoft.Extensions.Caching.StackExchangeRedis" />',
  );
  return text;
});

await update("server/src/StarterKit.Api/Program.cs", (text) => {
  text = insertBefore(
    text,
    "using StarterKit.Api.Wolverine;",
    "using StarterKit.Api.Auth;\n",
  );
  text = insertAfter(
    text,
    "builder.Services.AddOpenApi();",
    "\nbuilder.Services.AddKeycloakCookieAuth(builder.Configuration, builder.Environment);",
  );
  text = insertBefore(
    text,
    "app.MapDefaultEndpoints();",
    "app.UseAuthentication();\napp.UseAuthorization();\n\n",
  );
  text = insertAfter(
    text,
    "app.MapDefaultEndpoints();",
    "\napp.MapAuthEndpoints();",
  );
  return text;
});

for (const [relative, contents] of authFiles) {
  await write(relative, contents);
}

console.log("Added Keycloak OIDC auth with Redis-backed cookie tickets.");
