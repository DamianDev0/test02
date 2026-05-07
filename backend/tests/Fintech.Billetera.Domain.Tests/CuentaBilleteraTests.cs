using FluentAssertions;
using Fintech.Billetera.Domain.Aggregates;
using Fintech.Billetera.Domain.Events;
using Fintech.Billetera.Domain.Exceptions;
using Fintech.Billetera.Domain.ValueObjects;

namespace Fintech.Billetera.Domain.Tests;

public class CuentaBilleteraTests
{
    private const string PinValido = "1234";
    private const string PinInvalido = "9999";

    private static CuentaBilletera CuentaConSaldo(decimal saldo = 500_000m, string celular = "3001234567")
    {
        var cuenta = CuentaBilletera.Abrir(NumeroCelular.De(celular), PinValido);
        if (saldo > 0)
        {
            cuenta.CargarSaldo(Dinero.COP(saldo), "BANCO_BOGOTA");
        }
        cuenta.LimpiarEventos();
        return cuenta;
    }

    [Fact]
    public void Abrir_CelularValido_DebeCrearCuentaConSaldoCero()
    {
        var cuenta = CuentaBilletera.Abrir(NumeroCelular.De("3001234567"), PinValido);

        cuenta.ConsultarSaldo().Should().Be(Dinero.Cero());
        cuenta.EstaActiva().Should().BeTrue();

        var evento = cuenta.EventosDominio.OfType<CuentaBilleteraCreada>().Single();
        evento.NumeroCelular.Should().Be("3001234567");
    }

    [Fact]
    public void RealizarPago_SaldoInsuficiente_DebeRetornarFallo()
    {
        var origen = CuentaConSaldo(100_000m);
        var destino = CuentaBilletera.Abrir(NumeroCelular.De("3109876543"), "5678");

        var resultado = origen.RealizarPago(
            NumeroCelular.De("3109876543"), destino.Id, Dinero.COP(200_000m), "Prueba", PinValido);

        resultado.EsFallido.Should().BeTrue();
        resultado.Error.Should().Contain("Saldo insuficiente");
    }

    [Fact]
    public void RealizarPago_PinIncorrecto3Veces_DebeBloquearCuenta()
    {
        var origen = CuentaConSaldo();
        var destino = CuentaBilletera.Abrir(NumeroCelular.De("3109876543"), "5678");

        for (var i = 0; i < 3; i++)
        {
            origen.RealizarPago(
                NumeroCelular.De("3109876543"), destino.Id, Dinero.COP(1_000m), "Test", PinInvalido);
        }

        origen.EstaBloqueada().Should().BeTrue();
        origen.EventosDominio.OfType<CuentaBloqueada>().Should().ContainSingle();
    }

    [Fact]
    public void RealizarPago_CuentaBloqueada_DebeRetornarFallo()
    {
        var origen = CuentaConSaldo();
        origen.Bloquear("Prueba", "TEST");
        var destino = CuentaBilletera.Abrir(NumeroCelular.De("3109876543"), "5678");

        var resultado = origen.RealizarPago(
            NumeroCelular.De("3109876543"), destino.Id, Dinero.COP(1_000m), "Test", PinValido);

        resultado.EsFallido.Should().BeTrue();
    }

    [Fact]
    public void RealizarPago_Exitoso_DebePublicarPagoRealizado()
    {
        var origen = CuentaConSaldo(500_000m);
        var destino = CuentaBilletera.Abrir(NumeroCelular.De("3109876543"), "5678");

        var resultado = origen.RealizarPago(
            NumeroCelular.De("3109876543"), destino.Id, Dinero.COP(100_000m), "Pago de prueba", PinValido);

        resultado.EsExitoso.Should().BeTrue();
        var evento = origen.EventosDominio.OfType<PagoRealizado>().Single();
        evento.Monto.Should().Be(100_000m);
        evento.CelularDestino.Should().Be("3109876543");
        evento.CelularOrigen.Should().Be("3001234567");
    }

    [Fact]
    public void LimiteDiario_AlSuperar3M_DebeRetornarFallo()
    {
        var origen = CuentaBilletera.Abrir(NumeroCelular.De("3001234567"), PinValido);
        origen.CargarSaldo(Dinero.COP(5_000_000m), "BANCO_BOGOTA");
        var destino = CuentaBilletera.Abrir(NumeroCelular.De("3109876543"), "5678");

        origen.RealizarPago(
            NumeroCelular.De("3109876543"), destino.Id, Dinero.COP(2_800_000m), "1er pago", PinValido);
        var resultado = origen.RealizarPago(
            NumeroCelular.De("3109876543"), destino.Id, Dinero.COP(500_000m), "2do pago", PinValido);

        resultado.EsFallido.Should().BeTrue();
        resultado.Error.Should().Contain("Limite diario superado");
    }

    [Fact]
    public void Dinero_OperacionEnMonedaDistinta_DebeLanzarDomainException()
    {
        var cop = Dinero.COP(100m);
        var usd = Dinero.Crear(100m, "USD");

        var act = () => cop.Sumar(usd);

        act.Should().Throw<DomainException>();
    }

    [Theory]
    [InlineData("1234567890")]
    [InlineData("300123456")]
    [InlineData("")]
    public void NumeroCelular_FormatoInvalido_DebeFallar(string entrada)
    {
        var act = () => NumeroCelular.De(entrada);
        act.Should().Throw<DomainException>();
    }

    [Fact]
    public void CargarSaldo_PorEncimaDelMaximo_DebeRetornarFallo()
    {
        var cuenta = CuentaBilletera.Abrir(NumeroCelular.De("3001234567"), PinValido);

        var resultado = cuenta.CargarSaldo(Dinero.COP(10_000_000m), "BANCO");

        resultado.EsFallido.Should().BeTrue();
        resultado.Error.Should().Contain("supera");
    }

    [Fact]
    public void RealizarPago_AlMismoCelular_DebeRetornarFallo()
    {
        var origen = CuentaConSaldo();

        var resultado = origen.RealizarPago(
            NumeroCelular.De("3001234567"), origen.Id, Dinero.COP(1_000m), "Self", PinValido);

        resultado.EsFallido.Should().BeTrue();
    }
}
