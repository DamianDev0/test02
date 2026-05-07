namespace Fintech.Billetera.Infrastructure.Options;

public sealed class RenaperOptions
{
    public const string SectionName = "Renaper";
    public string BaseUrl { get; set; } = "https://renaper.example.com";
    public int TimeoutSeconds { get; set; } = 10;
}
