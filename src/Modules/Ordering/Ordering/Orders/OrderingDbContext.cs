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
    public DbSet<ShippingAddress> ShippingAddress => Set<ShippingAddress>();


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

        base.OnModelCreating(builder);
    }
}