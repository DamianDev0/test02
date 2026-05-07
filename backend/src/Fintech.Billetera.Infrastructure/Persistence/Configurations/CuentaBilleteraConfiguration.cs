using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Fintech.Billetera.Domain.Aggregates;
using Fintech.Billetera.Domain.ValueObjects;

namespace Fintech.Billetera.Infrastructure.Persistence.Configurations;

internal sealed class CuentaBilleteraConfiguration : IEntityTypeConfiguration<CuentaBilletera>
{
    public void Configure(EntityTypeBuilder<CuentaBilletera> builder)
    {
        builder.ToTable("cuentas");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).ValueGeneratedNever();

        builder.Property(x => x.Version).IsConcurrencyToken();

        builder.Property<NumeroCelular>("NumeroCelular")
            .HasConversion(v => v.Valor, v => NumeroCelular.De(v))
            .HasColumnName("numero_celular")
            .HasMaxLength(15)
            .IsRequired();
        builder.HasIndex("NumeroCelular").IsUnique();

        builder.ComplexProperty<PinSeguridad>("_pin", pb =>
        {
            pb.Property(p => p.Hash).HasColumnName("pin_hash").IsRequired();
            pb.Property(p => p.Salt).HasColumnName("pin_salt").IsRequired();
        });

        builder.ComplexProperty<Saldo>("_saldo", sb =>
        {
            sb.ComplexProperty(s => s.Disponible, db =>
            {
                db.Property(d => d.Monto).HasColumnName("saldo_monto").HasColumnType("numeric(18,2)").IsRequired();
                db.Property(d => d.Moneda).HasColumnName("saldo_moneda").HasMaxLength(3).IsRequired();
            });
        });

        builder.ComplexProperty<LimiteDiario>("_limiteDiario", lb =>
        {
            lb.ComplexProperty(l => l.LimiteMaximo, db =>
            {
                db.Property(d => d.Monto).HasColumnName("limite_max_monto").HasColumnType("numeric(18,2)").IsRequired();
                db.Property(d => d.Moneda).HasColumnName("limite_max_moneda").HasMaxLength(3).IsRequired();
            });
            lb.ComplexProperty(l => l.UsadoHoy, db =>
            {
                db.Property(d => d.Monto).HasColumnName("limite_usado_monto").HasColumnType("numeric(18,2)").IsRequired();
                db.Property(d => d.Moneda).HasColumnName("limite_usado_moneda").HasMaxLength(3).IsRequired();
            });
            lb.Property(l => l.FechaDeUso).HasColumnName("limite_fecha").IsRequired();
        });

        builder.Property<EstadoCuenta>("_estado")
            .HasColumnName("estado")
            .HasConversion<string>()
            .HasMaxLength(20)
            .IsRequired();

        builder.Property<int>("_intentosFallidos").HasColumnName("intentos_fallidos");

        builder.Ignore(x => x.EventosDominio);
        builder.Ignore(x => x.Estado);
        builder.Ignore(x => x.Saldo);
        builder.Ignore(x => x.LimiteDiario);
        builder.Ignore(x => x.IntentosFallidos);
        builder.Ignore(x => x.Pin);
    }
}
