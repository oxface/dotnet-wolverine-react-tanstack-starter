using StarterKit.Api.Wolverine;
using Wolverine;

WebApplicationBuilder builder = WebApplication.CreateBuilder(args);

builder.AddServiceDefaults();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddOpenApi();
builder.Host.UseWolverine(options => options.UseRuntimeCompilation());

WebApplication app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.MapDefaultEndpoints();

app.MapPost("/api/echo", async (EchoRequest request, IMessageBus bus) =>
    {
        EchoResponse response = await bus.InvokeAsync<EchoResponse>(
            new EchoCommand(request.Message));

        return Results.Ok(response);
    })
    .WithName("Echo");

app.Run();

public partial class Program;
