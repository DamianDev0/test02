using Fintech.Billetera.Domain.Events;

namespace Fintech.Billetera.Domain.Shared;

/// <summary>
/// Aggregate Root. Vernon Cap. 10. Almacena Domain Events para publicar tras commit.
/// </summary>
public abstract class AggregateRoot<TId>
{
    public TId Id { get; protected set; } = default!;
    public int Version { get; protected set; }

    private readonly List<IDomainEvent> _eventos = [];
    public IReadOnlyList<IDomainEvent> EventosDominio => _eventos.AsReadOnly();

    protected void AgregarEvento(IDomainEvent evento) => _eventos.Add(evento);

    public void LimpiarEventos() => _eventos.Clear();
}
