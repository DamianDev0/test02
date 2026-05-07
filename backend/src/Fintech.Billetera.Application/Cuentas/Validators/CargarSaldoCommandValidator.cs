using FluentValidation;
using Fintech.Billetera.Application.Cuentas.Commands;

namespace Fintech.Billetera.Application.Cuentas.Validators;

public sealed class CargarSaldoCommandValidator : AbstractValidator<CargarSaldoCommand>
{
    public CargarSaldoCommandValidator()
    {
        RuleFor(x => x.CuentaId.Value).NotEmpty();
        RuleFor(x => x.Monto).GreaterThan(0);
        RuleFor(x => x.Origen).NotEmpty();
    }
}
