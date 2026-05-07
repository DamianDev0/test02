namespace Fintech.Billetera.Infrastructure.Options;

public sealed class RabbitMqOptions
{
    public const string SectionName = "RabbitMQ";
    public string Host { get; set; } = "localhost";
    public string VirtualHost { get; set; } = "/";
    public string Username { get; set; } = "guest";
    public string Password { get; set; } = "guest";
    public ushort Port { get; set; } = 5672;
}
