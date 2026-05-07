namespace Fintech.Billetera.Domain.Shared;

/// <summary>
/// Result pattern: representa éxito/fallo sin excepciones.
/// Excepciones (DomainException) reservadas para violaciones de invariantes críticas.
/// Result usado para flujos de control esperados.
/// </summary>
public readonly record struct Result
{
    public bool EsExitoso { get; }
    public string? Error { get; }
    public bool EsFallido => !EsExitoso;

    private Result(bool exitoso, string? error)
    {
        EsExitoso = exitoso;
        Error = error;
    }

    public static Result Exito() => new(true, null);
    public static Result Fallo(string error) => new(false, error);
}

public readonly record struct Result<T>
{
    public bool EsExitoso { get; }
    public string? Error { get; }
    public T? Valor { get; }
    public bool EsFallido => !EsExitoso;

    private Result(bool exitoso, T? valor, string? error)
    {
        EsExitoso = exitoso;
        Valor = valor;
        Error = error;
    }

    public static Result<T> Exito(T valor) => new(true, valor, null);
    public static Result<T> Fallo(string error) => new(false, default, error);
}
