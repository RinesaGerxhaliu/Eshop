﻿using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Ordering.Data.Configurations;
public class OrderConfiguration : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> builder)
    {
        builder.HasKey(e => e.Id);

        builder.Property(o => o.CustomerId);

        builder.HasIndex(e => e.OrderName)
               .IsUnique();

        builder.Property(e => e.OrderName)
               .IsRequired()
               .HasMaxLength(100);

        builder.HasMany(s => s.Items)
           .WithOne()
           .HasForeignKey(si => si.OrderId);
    }
}