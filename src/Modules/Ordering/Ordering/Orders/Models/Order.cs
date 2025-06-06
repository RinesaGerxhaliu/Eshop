namespace Ordering.Orders.Models;
public class Order : Aggregate<Guid>
{
    private readonly List<OrderItem> _items = new();
    public IReadOnlyList<OrderItem> Items => _items.AsReadOnly();

    public Guid CustomerId { get; private set; } = default!;
    public decimal TotalPrice => Items.Sum(x => x.Price * x.Quantity);
    public string CurrencyCode { get; private set; } = "EUR";
    public decimal ExchangeRate { get; private set; } = 1m;
    public decimal TotalInCurrency { get; private set; }    


    public static Order Create(Guid id, Guid customerId)
    {
        var order = new Order
        {
            Id = id,
            CustomerId = customerId,
        };

        order.AddDomainEvent(new OrderCreatedEvent(order));

        return order;
    }

    public void ApplyCurrency(string currencyCode, decimal rate)
    {
        if (string.IsNullOrWhiteSpace(currencyCode))
            throw new ArgumentNullException(nameof(currencyCode));
        if (rate <= 0)
            throw new ArgumentOutOfRangeException(nameof(rate));

        CurrencyCode = currencyCode;
        ExchangeRate = rate;
        TotalInCurrency = Math.Round(TotalPrice * rate, 2);
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