using Fintech.Billetera.Application.Abstractions;
using Fintech.Billetera.Application.Catalogos.Queries;
using Fintech.Billetera.Domain.Catalogos;

namespace Fintech.Billetera.Application.Catalogos.Handlers;

public sealed class ListarBancosHandler(IBancoCatalogo catalogo)
    : IQueryHandler<ListarBancosQuery, IReadOnlyList<BancoDto>>
{
    public async Task<IReadOnlyList<BancoDto>> HandleAsync(ListarBancosQuery query, CancellationToken ct = default)
    {
        var bancos = await catalogo.ListarAsync(ct).ConfigureAwait(false);
        return bancos.Select(b => new BancoDto(b.Codigo, b.Nombre)).ToList().AsReadOnly();
    }
}
