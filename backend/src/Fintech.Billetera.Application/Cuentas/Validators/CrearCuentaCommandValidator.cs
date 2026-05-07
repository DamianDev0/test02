using FluentValidation;
using Fintech.Billetera.Application.Cuentas.Commands;

namespace Fintech.Billetera.Application.Cuentas.Validators;

public sealed class CrearCuentaCommandValidator : AbstractValidator<CrearCuentaCommand>
{
    public CrearCuentaCommandValidator()
    {
        RuleFor(x => x.Celular).NotEmpty();
        RuleFor(x => x.Pin).NotEmpty().Length(4).Matches("^[0-9]+$");
    }
}
