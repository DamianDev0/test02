using Fintech.Billetera.Domain.Shared;

namespace Fintech.Billetera.Application.Cuentas.Commands;

public sealed record CargarSaldoCommand(CuentaId CuentaId, decimal Monto, string Origen);
