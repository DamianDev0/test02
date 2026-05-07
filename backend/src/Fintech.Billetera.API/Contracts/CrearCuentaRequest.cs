namespace Fintech.Billetera.API.Contracts;

public sealed record CrearCuentaRequest(string Celular, string Pin);
public sealed record CrearCuentaResponse(Guid CuentaId);

public sealed record CargarSaldoRequest(decimal Monto, string Origen);

public sealed record RealizarPagoRequest(string CelularDestino, decimal Monto, string Concepto, string Pin);
public sealed record RealizarPagoResponse(Guid TransaccionId);

public sealed record ConsultarSaldoResponse(decimal Monto, string Moneda);
