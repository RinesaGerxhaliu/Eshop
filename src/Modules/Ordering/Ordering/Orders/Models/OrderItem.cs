namespace Ordering.Orders.Models;
public class OrderItem : Entity<Guid>
{
    internal OrderItem(Guid orderId, Guid productId, string productName, int quantity, decimal price)
    {
        OrderId = orderId;
        ProductId = productId;
        Quantity = quantity;
        Price = price;
        ProductName = productName;
    }

    public Guid OrderId { get; private set; } = default!;
    public Guid ProductId { get; private set; } = default!;
    public string? ProductName { get; private set; } = default!;
    public int Quantity { get; internal set; } = default!;
    public decimal Price { get; private set; } = default!;

   
    public decimal LineTotalInEur => Price * Quantity;
    public decimal LineTotalInCurrency { get; private set; }
    public decimal UnitPriceInCurrency { get; private set; }

    internal void ApplyExchangeRate(decimal rate)
    {
        UnitPriceInCurrency = Math.Round(Price * rate, 2);
        LineTotalInCurrency = Math.Round(UnitPriceInCurrency * Quantity, 2);
    }
}