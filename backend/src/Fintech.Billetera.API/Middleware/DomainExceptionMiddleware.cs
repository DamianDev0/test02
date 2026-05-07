using System.Net;
using System.Text.Json;
using Fintech.Billetera.Domain.Exceptions;

namespace Fintech.Billetera.API.Middleware;

public sealed class DomainExceptionMiddleware(RequestDelegate next, ILogger<DomainExceptionMiddleware> logger)
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context).ConfigureAwait(false);
        }
        catch (DomainException ex)
        {
            logger.LogWarning(ex, "Violacion de regla de negocio: {Mensaje}", ex.Message);
            await EscribirProblemaAsync(context, HttpStatusCode.UnprocessableEntity, "domain_rule_violated", ex.Message).ConfigureAwait(false);
        }
        catch (FluentValidation.ValidationException ex)
        {
            logger.LogWarning(ex, "Validacion fallida");
            var detalles = string.Join("; ", ex.Errors.Select(e => $"{e.PropertyName}: {e.ErrorMessage}"));
            await EscribirProblemaAsync(context, HttpStatusCode.BadRequest, "validation_failed", detalles).ConfigureAwait(false);
        }
    }

    private static async Task EscribirProblemaAsync(HttpContext context, HttpStatusCode status, string code, string detail)
    {
        context.Response.ContentType = "application/problem+json";
        context.Response.StatusCode = (int)status;
        var problema = new
        {
            type = $"about:blank",
            title = code,
            status = (int)status,
            detail
        };
        await context.Response.WriteAsync(JsonSerializer.Serialize(problema, JsonOptions)).ConfigureAwait(false);
    }
}
