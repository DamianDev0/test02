using Asp.Versioning;
using Microsoft.AspNetCore.Mvc;
using Fintech.Billetera.Application.Abstractions;
using Fintech.Billetera.Application.Catalogos.Queries;

namespace Fintech.Billetera.API.Controllers;

[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/bancos")]
[Produces("application/json")]
public sealed class BancosController(
    IQueryHandler<ListarBancosQuery, IReadOnlyList<BancoDto>> listar) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<BancoDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<BancoDto>>> Listar(CancellationToken ct)
    {
        var bancos = await listar.HandleAsync(new ListarBancosQuery(), ct).ConfigureAwait(false);
        Response.Headers.CacheControl = "public, max-age=3600";
        return Ok(bancos);
    }
}
