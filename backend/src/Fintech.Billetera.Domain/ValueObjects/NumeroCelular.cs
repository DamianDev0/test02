using System.Text.RegularExpressions;
using Fintech.Billetera.Domain.Exceptions;
using Fintech.Billetera.Domain.Resources;

namespace Fintech.Billetera.Domain.ValueObjects;

public sealed partial record NumeroCelular
{
    public string Valor { get; }

    private NumeroCelular(string valor) => Valor = valor;

    public static NumeroCelular De(string numero)
    {
        var limpio = (numero ?? string.Empty).Replace(" ", "").Replace("-", "").Trim();

        if (!CelularRegex().IsMatch(limpio))
        {
            throw new DomainException(ErrorMessages.CelularInvalido(numero ?? string.Empty));
        }

        return new NumeroCelular(limpio);
    }

    public bool EsDelMismoOperador(NumeroCelular otro) => Valor[..3] == otro.Valor[..3];

    public override string ToString() => $"{Valor[..3]} {Valor[3..6]} {Valor[6..]}";

    [GeneratedRegex(@"^3\d{9}$")]
    private static partial Regex CelularRegex();
}
