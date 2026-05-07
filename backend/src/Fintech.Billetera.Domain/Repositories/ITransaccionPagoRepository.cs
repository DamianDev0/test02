using Fintech.Billetera.Domain.Aggregates;
using Fintech.Billetera.Domain.Shared;

namespace Fintech.Billetera.Domain.Repositories;

public interface ITransaccionPagoRepository
{
    Task<TransaccionPago?> ObtenerPorIdAsync(TransaccionId id, CancellationToken ct = default);
    Task<IReadOnlyList<TransaccionPago>> ListarPorCuentaAsync(CuentaId cuentaId, int limite, CancellationToken ct = default);
    Task GuardarAsync(TransaccionPago transaccion, CancellationToken ct = default);
}
