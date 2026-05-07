using Fintech.Billetera.Domain.Exceptions;
using Fintech.Billetera.Domain.Resources;

namespace Fintech.Billetera.Domain.ValueObjects;

public sealed record LimiteDiario
{
    public Dinero LimiteMaximo { get; }
    public Dinero UsadoHoy { get; }
    public DateOnly FechaDeUso { get; }

    private LimiteDiario()
    {
        LimiteMaximo = Dinero.Cero();
        UsadoHoy = Dinero.Cero();
        FechaDeUso = DateOnly.FromDateTime(DateTime.UtcNow);
    }

    private LimiteDiario(Dinero limiteMaximo, Dinero usadoHoy, DateOnly fechaDeUso)
    {
        LimiteMaximo = limiteMaximo;
        UsadoHoy = usadoHoy;
        FechaDeUso = fechaDeUso;
    }

    public static LimiteDiario Predeterminado() =>
        new(Dinero.COP(3_000_000m), Dinero.Cero(), DateOnly.FromDateTime(DateTime.UtcNow));

    public static LimiteDiario Restaurar(Dinero max, Dinero usado, DateOnly fecha) =>
        new(max, usado, fecha);

    public LimiteDiario RegistrarConsumo(Dinero monto, DateOnly hoy)
    {
        var usadoBase = FechaDeUso == hoy ? UsadoHoy : Dinero.Cero();
        var nuevoUsado = usadoBase.Sumar(monto);

        if (nuevoUsado.EsMayorQue(LimiteMaximo))
        {
            throw new DomainException(ErrorMessages.LimiteDiarioSuperado(LimiteMaximo, usadoBase, monto));
        }

        return new LimiteDiario(LimiteMaximo, nuevoUsado, hoy);
    }

    public Dinero DisponibleHoy(DateOnly hoy)
    {
        var usado = FechaDeUso == hoy ? UsadoHoy : Dinero.Cero();
        return LimiteMaximo.Restar(usado);
    }

    public bool EstaCercaDelLimite(DateOnly hoy)
    {
        var disponible = DisponibleHoy(hoy);
        var umbral = LimiteMaximo.Monto * 0.20m;
        return disponible.Monto <= umbral;
    }
}
