using System.Security.Cryptography;
using System.Text;
using Fintech.Billetera.Domain.Exceptions;
using Fintech.Billetera.Domain.Resources;

namespace Fintech.Billetera.Domain.ValueObjects;

public sealed record PinSeguridad
{
    public string Hash { get; }
    public string Salt { get; }

    public PinSeguridad(string hash, string salt)
    {
        Hash = hash;
        Salt = salt;
    }

    public static PinSeguridad Crear(string pinPlano)
    {
        if (string.IsNullOrWhiteSpace(pinPlano) || pinPlano.Length != 4 || !pinPlano.All(char.IsDigit))
        {
            throw new DomainException(ErrorMessages.PinFormatoInvalido);
        }

        var saltBytes = RandomNumberGenerator.GetBytes(16);
        var salt = Convert.ToBase64String(saltBytes);
        var hash = Hashear(pinPlano, salt);
        return new PinSeguridad(hash, salt);
    }

    public static PinSeguridad Restaurar(string hash, string salt) => new PinSeguridad(hash, salt);

    public bool Coincide(string pinIngresado)
    {
        if (string.IsNullOrEmpty(pinIngresado))
        {
            return false;
        }
        var calculado = Hashear(pinIngresado, Salt);
        return CryptographicOperations.FixedTimeEquals(
            Encoding.UTF8.GetBytes(calculado),
            Encoding.UTF8.GetBytes(Hash));
    }

    private static string Hashear(string pin, string salt)
    {
        var bytes = Encoding.UTF8.GetBytes(pin + salt);
        var hashBytes = SHA256.HashData(bytes);
        return Convert.ToBase64String(hashBytes);
    }
}
