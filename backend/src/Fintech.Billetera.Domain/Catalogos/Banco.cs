namespace Fintech.Billetera.Domain.Catalogos;

/// <summary>
/// Value object del catálogo de bancos. Sin invariantes — read-only.
/// Subdominio Generic — el catálogo no diferencia el negocio.
/// </summary>
public sealed record Banco(string Codigo, string Nombre);
