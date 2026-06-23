using Aspire.Hosting;

IDistributedApplicationBuilder builder = DistributedApplication.CreateBuilder(args);

var postgresUsername = builder.AddParameter("postgres-username");
var postgresPassword = builder.AddParameter("postgres-password", secret: true);

var postgres = builder
    .AddPostgres("postgres", postgresUsername, postgresPassword, port: 5432)
    .WithDataVolume("starter-kit-postgres")
    .WithPgAdmin();
var database = postgres.AddDatabase("app-db", "starter_kit");

var cache = builder
    .AddRedis("cache", port: 6379)
    .WithDataVolume("starter-kit-cache");
var sessionTickets = builder
    .AddRedis("session-tickets", port: 6380)
    .WithDataVolume("starter-kit-session-tickets");

var keycloakUsername = builder.AddParameter("keycloak-username");
var keycloakPassword = builder.AddParameter("keycloak-password", secret: true);
var keycloak = builder
    .AddKeycloak("keycloak", 8080, keycloakUsername, keycloakPassword)
    .WithDataVolume("starter-kit-keycloak");

var api = builder
    .AddProject<Projects.StarterKit_Api>("api")
    .WithExternalHttpEndpoints()
    .WithReference(database)
    .WithReference(cache)
    .WithReference(sessionTickets)
    .WithHttpHealthCheck("/health")
    .WaitFor(database)
    .WaitFor(cache)
    .WaitFor(sessionTickets)
    .WaitFor(keycloak);

builder
    .AddViteApp("web", "../../web/apps/starter-kit-web")
    .WithEndpoint("http", endpoint => endpoint.Port = 5173)
    .WithPnpm(install: false)
    .WithReference(api)
    .WithEnvironment("VITE_API_ORIGIN", api.GetEndpoint("http"))
    .WaitFor(api);

builder.Build().Run();
