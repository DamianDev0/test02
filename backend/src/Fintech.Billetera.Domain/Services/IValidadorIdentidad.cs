namespace Fintech.Billetera.Domain.Services;

/// <summary>
/// Domain Service. Implementación traduce sistema externo (Renaper/RNEC) al lenguaje del dominio.
/// </summary>
public interface IValidadorIdentidad
{
    Task<ResultadoValidacionIdentidad> ValidarAsync(string numeroCedula, CancellationToken ct = default);
}

public sealed record ResultadoValidacionIdentidad(
    bool EsValida,
    string Nombre,
    bool EstaEnListaNegra)
{
    public static ResultadoValidacionIdentidad NoEncontrado() => new(false, string.Empty, false);
}
