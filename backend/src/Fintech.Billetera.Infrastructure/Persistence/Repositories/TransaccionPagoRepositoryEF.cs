using Microsoft.EntityFrameworkCore;
using Fintech.Billetera.Domain.Aggregates;
using Fintech.Billetera.Domain.Repositories;
using Fintech.Billetera.Domain.Shared;

namespace Fintech.Billetera.Infrastructure.Persistence.Repositories;

internal sealed class TransaccionPagoRepositoryEF(BilleteraDbContext ctx) : ITransaccionPagoRepository
{
    public Task<TransaccionPago?> ObtenerPorIdAsync(TransaccionId id, CancellationToken ct = default) =>
        ctx.Transacciones.FirstOrDefaultAsync(t => t.Id == id, ct);

    public async Task<IReadOnlyList<TransaccionPago>> ListarPorCuentaAsync(
        CuentaId cuentaId, int limite, CancellationToken ct = default)
    {
        var lista = await ctx.Transacciones
            .Where(t => t.CuentaId == cuentaId)
            .OrderByDescending(t => t.CreadaEn)
            .Take(limite)
            .ToListAsync(ct)
            .ConfigureAwait(false);
        return lista;
    }

    public async Task GuardarAsync(TransaccionPago transaccion, CancellationToken ct = default)
    {
        ArgumentNullException.ThrowIfNull(transaccion);
        var existe = await ctx.Transacciones.AnyAsync(t => t.Id == transaccion.Id, ct).ConfigureAwait(false);
        if (existe)
        {
            ctx.Transacciones.Update(transaccion);
        }
        else
        {
            await ctx.Transacciones.AddAsync(transaccion, ct).ConfigureAwait(false);
        }
    }
}
