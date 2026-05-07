using Fintech.Billetera.Domain.Shared;

namespace Fintech.Billetera.Application.Cuentas.Commands;

public sealed record RealizarPagoCommand(
    CuentaId CuentaOrigenId,
    string CelularDestino,
    decimal Monto,
    string Concepto,
    string Pin);
