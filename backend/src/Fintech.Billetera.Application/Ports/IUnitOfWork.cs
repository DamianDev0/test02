namespace Fintech.Billetera.Application.Ports;

public interface IUnitOfWork
{
    Task<int> CompletarAsync(CancellationToken ct = default);
    Task EjecutarEnTransaccionAsync(Func<CancellationToken, Task> trabajo, CancellationToken ct = default);
}
