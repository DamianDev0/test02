using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Fintech.Billetera.Domain.Aggregates;
using Fintech.Billetera.Domain.ValueObjects;

namespace Fintech.Billetera.Infrastructure.Persistence.Configurations;

internal sealed class TransaccionPagoConfiguration : IEntityTypeConfiguration<TransaccionPago>
{
    public void Configure(EntityTypeBuilder<TransaccionPago> builder)
    {
        builder.ToTable("transacciones");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).ValueGeneratedNever();

        builder.Property(x => x.CuentaId).HasColumnName("cuenta_id").IsRequired();
        builder.HasIndex(x => x.CuentaId);

        builder.Property(x => x.Destino)
            .HasConversion(v => v.Valor, v => NumeroCelular.De(v))
            .HasColumnName("destino")
            .HasMaxLength(15)
            .IsRequired();

        builder.ComplexProperty(x => x.Monto, db =>
        {
            db.Property(d => d.Monto).HasColumnName("monto").HasColumnType("numeric(18,2)").IsRequired();
            db.Property(d => d.Moneda).HasColumnName("moneda").HasMaxLength(3).IsRequired();
        });

        builder.Property(x => x.Concepto).HasColumnName("concepto").HasMaxLength(140).IsRequired();
        builder.Property(x => x.Estado).HasColumnName("estado").HasConversion<string>().HasMaxLength(20).IsRequired();
        builder.Property(x => x.CreadaEn).HasColumnName("creada_en").IsRequired();
    }
}
