using System.Net;

namespace Ordering.Orders.Models;
public class Order : Aggregate<Guid>
{
    private readonly List<OrderItem> _items = new();
    public IReadOnlyList<OrderItem> Items => _items.AsReadOnly();

    public Guid CustomerId { get; private set; } = default!;
    public string OrderName { get; private set; } = default!;
    public decimal TotalPrice => Items.Sum(x => x.Price * x.Quantity);

    public static Order Create(Guid id, Guid customerId, string orderName)
    {
        var order = new Order
        {
            Id = id,
            CustomerId = customerId,
            OrderName = orderName
        };

        order.AddDomainEvent(new OrderCreatedEvent(order));

        return order;
    }

    public void Add(Guid productId, int quantity, decimal price)
    {
        ArgumentOutOfRangeException.ThrowIfNegativeOrZero(quantity);
        ArgumentOutOfRangeException.ThrowIfNegativeOrZero(price);

        var existingItem = Items.FirstOrDefault(x => x.ProductId == productId);

        if (existingItem != null)
        {
            existingItem.Quantity += quantity;
        }
        else
        {
            var orderItem = new OrderItem(Id, productId, quantity, price);
            _items.Add(orderItem);
        }
    }

    public void Remove(Guid productId)
    {
        var orderItem = _items.FirstOrDefault(x => x.ProductId == productId);
        if (orderItem is not null)
        {
            _items.Remove(orderItem);
        }
    }
}