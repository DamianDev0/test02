using Fintech.Billetera.Domain.Exceptions;
using Fintech.Billetera.Domain.Resources;

namespace Fintech.Billetera.Domain.ValueObjects;

public sealed record Saldo
{
    public Dinero Disponible { get; }

    private Saldo()
    {
        Disponible = Dinero.Cero();
    }

    private Saldo(Dinero disponible)
    {
        Disponible = disponible;
    }

    public static Saldo De(Dinero disponible)
    {
        if (disponible.EsMenorQue(Dinero.Cero()))
        {
            throw new DomainException(ErrorMessages.SaldoNegativo);
        }
        return new Saldo(disponible);
    }

    public static Saldo Inicial() => new(Dinero.Cero());

    public Saldo Incrementar(Dinero monto) => new(Disponible.Sumar(monto));

    public Saldo Decrementar(Dinero monto)
    {
        if (monto.EsMayorQue(Disponible))
        {
            throw new DomainException(ErrorMessages.SaldoInsuficiente(Disponible, monto));
        }
        return new Saldo(Disponible.Restar(monto));
    }

    public bool AlcanzaPara(Dinero monto) => !monto.EsMayorQue(Disponible);

    public override string ToString() => $"Saldo: {Disponible}";
}
