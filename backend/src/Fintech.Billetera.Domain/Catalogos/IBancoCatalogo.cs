namespace Fintech.Billetera.Domain.Catalogos;

public interface IBancoCatalogo
{
    Task<IReadOnlyList<Banco>> ListarAsync(CancellationToken ct = default);
}
