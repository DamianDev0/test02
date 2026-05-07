using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace Fintech.Billetera.Infrastructure.Persistence;

/// <summary>
/// Design-time factory para `dotnet ef`. Bypassea Program.cs (evita bootear
/// MassTransit/RabbitMQ durante migraciones).
/// Connection string vía env var BILLETERA_DESIGN_CONN — sin secretos en código.
/// </summary>
internal sealed class BilleteraDbContextFactory : IDesignTimeDbContextFactory<BilleteraDbContext>
{
    private const string EnvVar = "BILLETERA_DESIGN_CONN";
    private const string DefaultLocalConn = "Host=localhost;Port=5432;Database=billetera_design;Include Error Detail=true";

    public BilleteraDbContext CreateDbContext(string[] args)
    {
        var conn = Environment.GetEnvironmentVariable(EnvVar) ?? DefaultLocalConn;

        var options = new DbContextOptionsBuilder<BilleteraDbContext>()
            .UseNpgsql(conn, npgsql =>
                npgsql.MigrationsHistoryTable("__ef_migrations_history", "billetera"))
            .Options;

        return new BilleteraDbContext(options);
    }
}
