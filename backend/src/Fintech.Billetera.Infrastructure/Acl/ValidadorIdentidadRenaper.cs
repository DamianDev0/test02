using System.Net.Http.Json;
using Microsoft.Extensions.Logging;
using Fintech.Billetera.Domain.Services;

namespace Fintech.Billetera.Infrastructure.Acl;

/// <summary>
/// Anti-Corruption Layer hacia Renaper/RNEC. Vernon p.106.
/// Traduce el modelo externo al lenguaje del dominio.
/// </summary>
internal sealed class ValidadorIdentidadRenaper(
    HttpClient http,
    ILogger<ValidadorIdentidadRenaper> logger) : IValidadorIdentidad
{
    public async Task<ResultadoValidacionIdentidad> ValidarAsync(string numeroCedula, CancellationToken ct = default)
    {
        try
        {
            var dto = await http.GetFromJsonAsync<RenaperResponseDto>(
                $"/api/v2/citizen/{numeroCedula}/validate", ct).ConfigureAwait(false);

            if (dto is null)
            {
                return ResultadoValidacionIdentidad.NoEncontrado();
            }

            return RenaperTranslator.Traducir(dto);
        }
        catch (HttpRequestException ex)
        {
            logger.LogWarning(ex, "Error consultando Renaper para cedula {Cedula}", numeroCedula);
            return ResultadoValidacionIdentidad.NoEncontrado();
        }
    }
}

internal sealed record RenaperResponseDto(
    string NationalId,
    string FullName,
    string Status,
    bool Biometric,
    string? WatchlistMatch);

internal static class RenaperTranslator
{
    public static ResultadoValidacionIdentidad Traducir(RenaperResponseDto dto) =>
        new(
            EsValida: dto.Status == "ACTIVE" && dto.Biometric,
            Nombre: dto.FullName,
            EstaEnListaNegra: !string.IsNullOrEmpty(dto.WatchlistMatch));
}
