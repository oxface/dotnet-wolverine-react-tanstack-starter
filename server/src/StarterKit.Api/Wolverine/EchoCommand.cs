namespace StarterKit.Api.Wolverine;

public sealed record EchoRequest(string Message);

public sealed record EchoCommand(string Message);

public sealed record EchoResponse(string Message, DateTimeOffset HandledAtUtc);

public static class EchoCommandHandler
{
    public static EchoResponse Handle(EchoCommand command)
    {
        return new EchoResponse(command.Message, DateTimeOffset.UtcNow);
    }
}
