using Fintech.Billetera.Domain.Aggregates;
using Fintech.Billetera.Domain.Shared;
using Fintech.Billetera.Domain.ValueObjects;

namespace Fintech.Billetera.Domain.Repositories;

public interface ICuentaBilleteraRepository
{
    Task<CuentaBilletera?> ObtenerPorIdAsync(CuentaId id, CancellationToken ct = default);
    Task<CuentaBilletera?> ObtenerPorCelularAsync(NumeroCelular celular, CancellationToken ct = default);
    Task<bool> ExisteCelularAsync(NumeroCelular celular, CancellationToken ct = default);
    Task GuardarAsync(CuentaBilletera cuenta, CancellationToken ct = default);
}
