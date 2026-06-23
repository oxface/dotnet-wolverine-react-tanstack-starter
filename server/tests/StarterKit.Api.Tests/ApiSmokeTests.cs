using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using Shouldly;
using Xunit;

namespace StarterKit.Api.Tests;

public sealed class ApiSmokeTests(WebApplicationFactory<Program> factory)
    : IClassFixture<WebApplicationFactory<Program>>
{
    [Fact]
    public async Task Health_ReturnsOk()
    {
        HttpClient client = factory.CreateClient();

        using HttpResponseMessage response = await client.GetAsync("/health");

        response.EnsureSuccessStatusCode();
    }

    [Fact]
    public async Task Echo_UsesWolverineHandler()
    {
        HttpClient client = factory.CreateClient();

        using HttpResponseMessage response = await client.PostAsJsonAsync(
            "/api/echo",
            new { message = "hello" });

        response.EnsureSuccessStatusCode();
        EchoResponse? body = await response.Content.ReadFromJsonAsync<EchoResponse>();
        body.ShouldNotBeNull();
        body.Message.ShouldBe("hello");
        body.HandledAtUtc.ShouldBeGreaterThan(DateTimeOffset.UtcNow.AddMinutes(-1));
    }

    private sealed record EchoResponse(string Message, DateTimeOffset HandledAtUtc);
}
