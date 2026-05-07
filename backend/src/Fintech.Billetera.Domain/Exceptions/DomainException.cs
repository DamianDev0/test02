namespace Fintech.Billetera.Domain.Exceptions;

/// <summary>
/// Violación de regla de negocio. Vernon p.208.
/// </summary>
public sealed class DomainException : Exception
{
    public DomainException(string mensaje) : base(mensaje) { }
}
