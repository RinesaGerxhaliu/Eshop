namespace Ordering.Orders.Features.Orders
{
    public class CreateOrderCommand : IRequest<bool>
    {
        public DraftOrderDto Order { get; init; } = default!;
        public PaymentMethodType PaymentMethod { get; init; }
        public string? StripePaymentIntentId { get; init; }
        public string? CurrencyCode { get; init; }
    }
}
