using System.Globalization;
using System.Resources;

namespace Fintech.Billetera.Domain.Resources;

/// <summary>
/// Acceso tipado a ErrorMessages.resx (skill dotnet-design-pattern-review: Resource Pattern).
/// Mensajes localizables vía ResourceManager.
/// </summary>
public static class ErrorMessages
{
    private static readonly ResourceManager Manager = new(
        "Fintech.Billetera.Domain.Resources.ErrorMessages",
        typeof(ErrorMessages).Assembly);

    public static string Get(string key) =>
        Manager.GetString(key, CultureInfo.CurrentUICulture)
        ?? throw new InvalidOperationException($"Resource key no encontrada: {key}");

    public static string Format(string key, params object[] args) =>
        string.Format(CultureInfo.CurrentCulture, Get(key), args);

    public static string MontoNegativo => Get(nameof(MontoNegativo));
    public static string MonedaInvalida => Get(nameof(MonedaInvalida));
    public static string MonedasDistintas(string a, string b) => Format(nameof(MonedasDistintas), a, b);
    public static string SaldoInsuficiente(object disponible, object requerido) => Format(nameof(SaldoInsuficiente), disponible, requerido);
    public static string SaldoNegativo => Get(nameof(SaldoNegativo));
    public static string CelularInvalido(string entrada) => Format(nameof(CelularInvalido), entrada);
    public static string PinFormatoInvalido => Get(nameof(PinFormatoInvalido));
    public static string PinIncorrecto(int restantes) => Format(nameof(PinIncorrecto), restantes);
    public static string CuentaBloqueada => Get(nameof(CuentaBloqueada));
    public static string CuentaCerrada => Get(nameof(CuentaCerrada));
    public static string CuentaCerradaNoAcredita => Get(nameof(CuentaCerradaNoAcredita));
    public static string CuentaCerradaNoBloquea => Get(nameof(CuentaCerradaNoBloquea));
    public static string PagoMismoCelular => Get(nameof(PagoMismoCelular));
    public static string LimiteDiarioSuperado(object max, object usado, object solicitado) => Format(nameof(LimiteDiarioSuperado), max, usado, solicitado);
    public static string CargaSuperaMaximo(object max, object actual, object intentado) => Format(nameof(CargaSuperaMaximo), max, actual, intentado);
    public static string CuentaNoExiste(object id) => Format(nameof(CuentaNoExiste), id);
    public static string BilleteraNoExiste(string numero) => Format(nameof(BilleteraNoExiste), numero);
    public static string CelularYaRegistrado(string numero) => Format(nameof(CelularYaRegistrado), numero);
}
