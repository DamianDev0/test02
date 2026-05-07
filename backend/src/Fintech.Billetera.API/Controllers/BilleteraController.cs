using Asp.Versioning;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using Fintech.Billetera.API.Contracts;
using Fintech.Billetera.Application.Abstractions;
using Fintech.Billetera.Application.Cuentas.Commands;
using Fintech.Billetera.Application.Cuentas.Queries;
using Fintech.Billetera.Domain.Shared;

namespace Fintech.Billetera.API.Controllers;

[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/billetera")]
[Produces("application/json")]
public sealed class BilleteraController(
    ICommandHandler<CrearCuentaCommand, CuentaId> crearCuenta,
    ICommandHandler<CargarSaldoCommand> cargarSaldo,
    ICommandHandler<RealizarPagoCommand, TransaccionId> realizarPago,
    IQueryHandler<ConsultarSaldoQuery, ConsultarSaldoResultado> consultarSaldo,
    IValidator<CrearCuentaCommand> crearValidator,
    IValidator<CargarSaldoCommand> cargarValidator,
    IValidator<RealizarPagoCommand> pagoValidator) : ControllerBase
{
    [HttpPost("cuentas")]
    [ProducesResponseType(typeof(CrearCuentaResponse), StatusCodes.Status201Created)]
    public async Task<ActionResult<CrearCuentaResponse>> CrearCuenta(
        [FromBody] CrearCuentaRequest request, CancellationToken ct)
    {
        ArgumentNullException.ThrowIfNull(request);
        var cmd = new CrearCuentaCommand(request.Celular, request.Pin);
        await crearValidator.ValidateAndThrowAsync(cmd, ct).ConfigureAwait(false);
        var id = await crearCuenta.HandleAsync(cmd, ct).ConfigureAwait(false);
        return CreatedAtAction(nameof(ConsultarSaldo), new { cuentaId = id.Value, version = "1.0" }, new CrearCuentaResponse(id.Value));
    }

    [HttpPost("cuentas/{cuentaId:guid}/cargas")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> CargarSaldo(
        Guid cuentaId, [FromBody] CargarSaldoRequest request, CancellationToken ct)
    {
        ArgumentNullException.ThrowIfNull(request);
        var cmd = new CargarSaldoCommand(new CuentaId(cuentaId), request.Monto, request.Origen);
        await cargarValidator.ValidateAndThrowAsync(cmd, ct).ConfigureAwait(false);
        await cargarSaldo.HandleAsync(cmd, ct).ConfigureAwait(false);
        return NoContent();
    }

    [HttpPost("cuentas/{cuentaId:guid}/pagos")]
    [ProducesResponseType(typeof(RealizarPagoResponse), StatusCodes.Status201Created)]
    public async Task<ActionResult<RealizarPagoResponse>> RealizarPago(
        Guid cuentaId, [FromBody] RealizarPagoRequest request, CancellationToken ct)
    {
        ArgumentNullException.ThrowIfNull(request);
        var cmd = new RealizarPagoCommand(new CuentaId(cuentaId), request.CelularDestino, request.Monto, request.Concepto, request.Pin);
        await pagoValidator.ValidateAndThrowAsync(cmd, ct).ConfigureAwait(false);
        var transaccionId = await realizarPago.HandleAsync(cmd, ct).ConfigureAwait(false);
        return CreatedAtAction(nameof(ConsultarSaldo), new { cuentaId, version = "1.0" }, new RealizarPagoResponse(transaccionId.Value));
    }

    [HttpGet("cuentas/{cuentaId:guid}/saldo")]
    [ProducesResponseType(typeof(ConsultarSaldoResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<ConsultarSaldoResponse>> ConsultarSaldo(Guid cuentaId, CancellationToken ct)
    {
        var resultado = await consultarSaldo.HandleAsync(new ConsultarSaldoQuery(new CuentaId(cuentaId)), ct).ConfigureAwait(false);
        return Ok(new ConsultarSaldoResponse(resultado.Monto, resultado.Moneda));
    }
}
