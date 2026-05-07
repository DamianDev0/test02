using Fintech.Billetera.Domain.Shared;
using Fintech.Billetera.Domain.ValueObjects;

namespace Fintech.Billetera.Domain.Aggregates;

public class TransaccionPago
{
    public TransaccionId Id { get; private set; }
    public CuentaId CuentaId { get; private set; }
    public NumeroCelular Destino { get; private set; } = null!;
    public Dinero Monto { get; private set; } = null!;
    public string Concepto { get; private set; } = string.Empty;
    public EstadoTransaccion Estado { get; private set; }
    public DateTimeOffset CreadaEn { get; private set; }

    private TransaccionPago() { }

    internal TransaccionPago(
        TransaccionId id,
        CuentaId cuentaId,
        NumeroCelular destino,
        Dinero monto,
        string concepto)
    {
        Id = id;
        CuentaId = cuentaId;
        Destino = destino;
        Monto = monto;
        Concepto = concepto;
        Estado = EstadoTransaccion.Pendiente;
        CreadaEn = DateTimeOffset.UtcNow;
    }

    internal void Confirmar() => Estado = EstadoTransaccion.Confirmada;
    internal void Rechazar() => Estado = EstadoTransaccion.Rechazada;
}

public enum EstadoTransaccion { Pendiente, Confirmada, Rechazada }
