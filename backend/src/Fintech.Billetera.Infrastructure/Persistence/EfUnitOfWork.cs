using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using Fintech.Billetera.Application.Ports;

namespace Fintech.Billetera.Infrastructure.Persistence;

internal sealed class EfUnitOfWork(BilleteraDbContext ctx) : IUnitOfWork
{
    public Task<int> CompletarAsync(CancellationToken ct = default) => ctx.SaveChangesAsync(ct);

    public async Task EjecutarEnTransaccionAsync(Func<CancellationToken, Task> trabajo, CancellationToken ct = default)
    {
        ArgumentNullException.ThrowIfNull(trabajo);

        var strategy = ctx.Database.CreateExecutionStrategy();
        await strategy.ExecuteAsync(
            trabajo,
            async (DbContext _, Func<CancellationToken, Task> work, CancellationToken token) =>
            {
                await using var tx = await ctx.Database.BeginTransactionAsync(token).ConfigureAwait(false);
                await work(token).ConfigureAwait(false);
                await tx.CommitAsync(token).ConfigureAwait(false);
                return 0;
            },
            verifySucceeded: null,
            cancellationToken: ct).ConfigureAwait(false);
    }
}
