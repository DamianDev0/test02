using Fintech.Billetera.Domain.Events;
using Fintech.Billetera.Domain.Exceptions;
using Fintech.Billetera.Domain.Resources;
using Fintech.Billetera.Domain.Shared;
using Fintech.Billetera.Domain.ValueObjects;

namespace Fintech.Billetera.Domain.Aggregates;

/// <summary>
/// Aggregate Root del Core Domain. Vernon p.354.
/// Invariantes:
///   1. Saldo nunca negativo
///   2. Pagos no superan límite diario regulatorio
///   3. Cuenta bloqueada no envía pagos
///   4. PIN correcto para operaciones sensibles
///   5. Cuenta cerrada no opera
/// </summary>
public class CuentaBilletera : AggregateRoot<CuentaId>
{
    public NumeroCelular NumeroCelular { get; private set; } = null!;
    private PinSeguridad _pin = null!;
    private Saldo _saldo = Saldo.Inicial();
    private LimiteDiario _limiteDiario = LimiteDiario.Predeterminado();
    private EstadoCuenta _estado = EstadoCuenta.Activa;
    private int _intentosFallidos;

    protected CuentaBilletera() { }

    public static CuentaBilletera Abrir(NumeroCelular celular, string pinPlano)
    {
        var cuenta = new CuentaBilletera
        {
            Id = CuentaId.Nuevo(),
            NumeroCelular = celular,
            _pin = PinSeguridad.Crear(pinPlano),
            _saldo = Saldo.Inicial(),
            _limiteDiario = LimiteDiario.Predeterminado(),
            _estado = EstadoCuenta.Activa,
            Version = 0
        };

        cuenta.AgregarEvento(new CuentaBilleteraCreada(
            cuenta.Id, celular.Valor, DateTimeOffset.UtcNow));

        return cuenta;
    }

    public Result CargarSaldo(Dinero monto, string origen)
    {
        if (_estado == EstadoCuenta.Bloqueada)
        {
            return Result.Fallo(ErrorMessages.CuentaBloqueada);
        }
        if (_estado == EstadoCuenta.Cerrada)
        {
            return Result.Fallo(ErrorMessages.CuentaCerrada);
        }

        var limiteAcumulado = Dinero.COP(9_000_000m);
        if (_saldo.Disponible.Sumar(monto).EsMayorQue(limiteAcumulado))
        {
            return Result.Fallo(ErrorMessages.CargaSuperaMaximo(limiteAcumulado, _saldo.Disponible, monto));
        }

        _saldo = _saldo.Incrementar(monto);
        Version++;

        AgregarEvento(new SaldoCargado(
            Id, monto.Monto, monto.Moneda,
            _saldo.Disponible.Monto, origen,
            DateTimeOffset.UtcNow));

        return Result.Exito();
    }

    public Result<TransaccionPago> RealizarPago(
        NumeroCelular destinoCelular,
        CuentaId cuentaDestinoId,
        Dinero monto,
        string concepto,
        string pinIngresado)
    {
        if (_estado == EstadoCuenta.Bloqueada)
        {
            return Result<TransaccionPago>.Fallo(ErrorMessages.CuentaBloqueada);
        }
        if (_estado == EstadoCuenta.Cerrada)
        {
            return Result<TransaccionPago>.Fallo(ErrorMessages.CuentaCerrada);
        }

        if (!_pin.Coincide(pinIngresado))
        {
            _intentosFallidos++;
            if (_intentosFallidos >= 3)
            {
                Bloquear("PIN incorrecto 3 veces consecutivas", "SISTEMA_SEGURIDAD");
            }
            return Result<TransaccionPago>.Fallo(ErrorMessages.PinIncorrecto(Math.Max(0, 3 - _intentosFallidos)));
        }

        _intentosFallidos = 0;

        if (destinoCelular == NumeroCelular)
        {
            return Result<TransaccionPago>.Fallo(ErrorMessages.PagoMismoCelular);
        }

        if (!_saldo.AlcanzaPara(monto))
        {
            AgregarEvento(new SaldoInsuficiente(
                Id, monto.Monto, _saldo.Disponible.Monto, monto.Moneda, DateTimeOffset.UtcNow));
            return Result<TransaccionPago>.Fallo(ErrorMessages.SaldoInsuficiente(_saldo.Disponible, monto));
        }

        var hoy = DateOnly.FromDateTime(DateTime.UtcNow);
        try
        {
            _limiteDiario = _limiteDiario.RegistrarConsumo(monto, hoy);
        }
        catch (DomainException ex)
        {
            return Result<TransaccionPago>.Fallo(ex.Message);
        }

        _saldo = _saldo.Decrementar(monto);
        Version++;

        var transaccion = new TransaccionPago(
            TransaccionId.Nuevo(), Id, destinoCelular, monto, concepto);
        transaccion.Confirmar();

        AgregarEvento(new PagoRealizado(
            transaccion.Id, Id, NumeroCelular.Valor,
            cuentaDestinoId, destinoCelular.Valor,
            monto.Monto, monto.Moneda, concepto,
            DateTimeOffset.UtcNow));

        return Result<TransaccionPago>.Exito(transaccion);
    }

    public Result RecibirPago(Dinero monto, TransaccionId transaccionOrigenId)
    {
        if (_estado == EstadoCuenta.Cerrada)
        {
            return Result.Fallo(ErrorMessages.CuentaCerradaNoAcredita);
        }

        _saldo = _saldo.Incrementar(monto);
        Version++;
        return Result.Exito();
    }

    public void Bloquear(string motivo, string activadoPor)
    {
        if (_estado == EstadoCuenta.Bloqueada)
        {
            return;
        }

        if (_estado == EstadoCuenta.Cerrada)
        {
            throw new DomainException(ErrorMessages.CuentaCerradaNoBloquea);
        }

        _estado = EstadoCuenta.Bloqueada;
        Version++;

        AgregarEvento(new CuentaBloqueada(Id, motivo, activadoPor, DateTimeOffset.UtcNow));
    }

    public Dinero ConsultarSaldo()
    {
        if (_estado == EstadoCuenta.Bloqueada)
        {
            throw new DomainException(ErrorMessages.CuentaBloqueada);
        }
        if (_estado == EstadoCuenta.Cerrada)
        {
            throw new DomainException(ErrorMessages.CuentaCerrada);
        }
        return _saldo.Disponible;
    }

    public bool EstaActiva() => _estado == EstadoCuenta.Activa;
    public bool EstaBloqueada() => _estado == EstadoCuenta.Bloqueada;
    public EstadoCuenta Estado => _estado;
    public Saldo Saldo => _saldo;
    public LimiteDiario LimiteDiario => _limiteDiario;
    public int IntentosFallidos => _intentosFallidos;
    public PinSeguridad Pin => _pin;
}

public enum EstadoCuenta { Activa, Bloqueada, Cerrada }
