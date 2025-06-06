namespace Ordering.Orders.Features.CreatePayment
{
    internal class CreatePaymentRequest
    {
        public Guid OrderId { get; set; }
        // You can also pass currency override if you allow multiple currencies:
        public string? CurrencyCode { get; set; }
    }
}
