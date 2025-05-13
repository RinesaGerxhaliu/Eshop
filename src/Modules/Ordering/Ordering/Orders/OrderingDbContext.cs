using Ordering.Shippings.Models;

namespace Ordering.Data;
public class OrderingDbContext : DbContext
{
    public OrderingDbContext(DbContextOptions<OrderingDbContext> options)
        : base(options) { }

    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<SavedAddress> SavedAddresses => Set<SavedAddress>();
    public DbSet<ShippingMethod> ShippingMethods => Set<ShippingMethod>();
    public DbSet<Payment> Payments => Set<Payment>();
    public DbSet<Shipment> Shipments => Set<Shipment>();


    protected override void OnModelCreating(ModelBuilder builder)
    {
        builder.HasDefaultSchema("ordering");
        builder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());
        base.OnModelCreating(builder);

        builder.Entity<Payment>(b =>
        {
            b.ToTable("Payments", "ordering");      
            b.HasKey(p => p.Id);

            b.HasIndex(p => p.OrderId)              
             .HasDatabaseName("IX_Payments_OrderId");

            b.HasOne<Order>()                       
             .WithMany()                            
             .HasForeignKey(p => p.OrderId)
             .HasConstraintName("FK_Payments_Orders_OrderId")
             .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<Shipment>(shipment =>
        {
            shipment.OwnsOne(s => s.Address, address =>
            {
                address.Property(a => a.Street).HasColumnName("Street");
                address.Property(a => a.City).HasColumnName("City");
                address.Property(a => a.State).HasColumnName("State");
                address.Property(a => a.PostalCode).HasColumnName("PostalCode");
                address.Property(a => a.Country).HasColumnName("Country");
                address.Property(a => a.PhoneNumber).HasColumnName("PhoneNumber");
            });
        });

        builder.Entity<SavedAddress>(savedAddress =>
        {
            savedAddress.OwnsOne(s => s.Address, address =>
            {
                address.Property(a => a.Street).HasColumnName("Street");
                address.Property(a => a.City).HasColumnName("City");
                address.Property(a => a.State).HasColumnName("State");
                address.Property(a => a.PostalCode).HasColumnName("PostalCode");
                address.Property(a => a.Country).HasColumnName("Country");
                address.Property(a => a.PhoneNumber).HasColumnName("PhoneNumber");
            });
        });

        base.OnModelCreating(builder);
    }
}