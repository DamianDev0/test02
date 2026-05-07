using Fintech.Billetera.Domain.Shared;

namespace Fintech.Billetera.Application.Cuentas.Queries;

public sealed record ConsultarSaldoQuery(CuentaId CuentaId);

public sealed record ConsultarSaldoResultado(decimal Monto, string Moneda);
