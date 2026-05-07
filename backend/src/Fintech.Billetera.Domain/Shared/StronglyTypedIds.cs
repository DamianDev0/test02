namespace Fintech.Billetera.Domain.Shared;

/// <summary>
/// IDs fuertemente tipados. Previenen mezclar GUIDs entre aggregates.
/// Guid v7: ordenable por timestamp, mejor para índices.
/// </summary>
public readonly record struct CuentaId(Guid Value)
{
    public static CuentaId Nuevo() => new(Guid.CreateVersion7());
    public static CuentaId De(Guid valor) => new(valor);
    public override string ToString() => Value.ToString();
}

public readonly record struct TransaccionId(Guid Value)
{
    public static TransaccionId Nuevo() => new(Guid.CreateVersion7());
    public static TransaccionId De(Guid valor) => new(valor);
    public override string ToString() => Value.ToString();
}
