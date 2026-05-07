using FluentAssertions;
using Fintech.Billetera.Domain.Exceptions;
using Fintech.Billetera.Domain.ValueObjects;

namespace Fintech.Billetera.Domain.Tests;

public class PinSeguridadTests
{
    [Fact]
    public void Crear_PinValido_HashYSaltDistintosDelPlano()
    {
        var pin = PinSeguridad.Crear("1234");

        pin.Hash.Should().NotBe("1234");
        pin.Salt.Should().NotBeNullOrEmpty();
    }

    [Fact]
    public void Coincide_PinCorrecto_RetornaTrue()
    {
        var pin = PinSeguridad.Crear("1234");
        pin.Coincide("1234").Should().BeTrue();
    }

    [Fact]
    public void Coincide_PinIncorrecto_RetornaFalse()
    {
        var pin = PinSeguridad.Crear("1234");
        pin.Coincide("9999").Should().BeFalse();
    }

    [Theory]
    [InlineData("123")]
    [InlineData("12345")]
    [InlineData("abcd")]
    [InlineData("")]
    public void Crear_PinInvalido_DebeFallar(string entrada)
    {
        var act = () => PinSeguridad.Crear(entrada);
        act.Should().Throw<DomainException>();
    }
}
