using Fintech.Billetera.Domain.Exceptions;
using Fintech.Billetera.Domain.Resources;

namespace Fintech.Billetera.Domain.ValueObjects;

public sealed record Dinero
{
    public decimal Monto { get; }
    public string Moneda { get; }

    public Dinero(decimal monto, string moneda)
    {
        Monto = monto;
        Moneda = moneda;
    }

    public static Dinero COP(decimal monto) => Crear(monto, "COP");
    public static Dinero Cero() => Crear(0m, "COP");

    public static Dinero Crear(decimal monto, string moneda)
    {
        if (monto < 0)
        {
            throw new DomainException(ErrorMessages.MontoNegativo);
        }

        if (string.IsNullOrWhiteSpace(moneda) || moneda.Length != 3)
        {
            throw new DomainException(ErrorMessages.MonedaInvalida);
        }

        return new Dinero(Math.Round(monto, 2), moneda.ToUpperInvariant());
    }

    public Dinero Sumar(Dinero otro)
    {
        ValidarMismaMoneda(otro);
        return new Dinero(Monto + otro.Monto, Moneda);
    }

    public Dinero Restar(Dinero otro)
    {
        ValidarMismaMoneda(otro);
        if (otro.Monto > Monto)
        {
            throw new DomainException(ErrorMessages.SaldoInsuficiente(this, otro));
        }
        return new Dinero(Monto - otro.Monto, Moneda);
    }

    public bool EsMayorQue(Dinero otro) { ValidarMismaMoneda(otro); return Monto > otro.Monto; }
    public bool EsMenorQue(Dinero otro) { ValidarMismaMoneda(otro); return Monto < otro.Monto; }
    public bool EsCero() => Monto == 0m;

    private void ValidarMismaMoneda(Dinero otro)
    {
        if (Moneda != otro.Moneda)
        {
            throw new DomainException(ErrorMessages.MonedasDistintas(Moneda, otro.Moneda));
        }
    }

    public override string ToString() => $"${Monto:N0} {Moneda}";
}
