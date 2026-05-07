using Fintech.Billetera.Domain.Catalogos;

namespace Fintech.Billetera.Infrastructure.Catalogos;

/// <summary>
/// Catálogo estático en memoria. MVP — mover a tabla cuando crezca.
/// Bancos vigilados por la Superfinanciera Colombia.
/// </summary>
internal sealed class BancoCatalogoEstatico : IBancoCatalogo
{
    private static readonly IReadOnlyList<Banco> Bancos = new List<Banco>
    {
        new("BANCOLOMBIA", "Bancolombia"),
        new("BBVA", "BBVA Colombia"),
        new("BANCO_BOGOTA", "Banco de Bogotá"),
        new("DAVIVIENDA", "Davivienda"),
        new("BANCO_OCCIDENTE", "Banco de Occidente"),
        new("BANCO_POPULAR", "Banco Popular"),
        new("BANCO_AV_VILLAS", "AV Villas"),
        new("BANCO_CAJA_SOCIAL", "Banco Caja Social"),
        new("ITAU", "Itaú Colombia"),
        new("SCOTIABANK_COLPATRIA", "Scotiabank Colpatria"),
        new("PSE", "PSE"),
        new("CORRESPONSAL", "Corresponsal Bancario"),
    }.AsReadOnly();

    public Task<IReadOnlyList<Banco>> ListarAsync(CancellationToken ct = default)
        => Task.FromResult(Bancos);
}
