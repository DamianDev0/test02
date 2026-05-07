using FluentValidation;
using Fintech.Billetera.Application.Cuentas.Commands;

namespace Fintech.Billetera.Application.Cuentas.Validators;

public sealed class RealizarPagoCommandValidator : AbstractValidator<RealizarPagoCommand>
{
    public RealizarPagoCommandValidator()
    {
        RuleFor(x => x.CuentaOrigenId.Value).NotEmpty();
        RuleFor(x => x.CelularDestino).NotEmpty();
        RuleFor(x => x.Monto).GreaterThan(0);
        RuleFor(x => x.Concepto).NotEmpty().MaximumLength(140);
        RuleFor(x => x.Pin).NotEmpty().Length(4).Matches("^[0-9]+$");
    }
}
