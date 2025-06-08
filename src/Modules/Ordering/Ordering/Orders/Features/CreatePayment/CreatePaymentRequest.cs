namespace Ordering.Orders.Features.CreatePayment
{
    internal class CreatePaymentRequest
    {
        public DraftOrderDto Order { get; set; } = default!;
        public string? CurrencyCode { get; set; }

        public PaymentMethodType PaymentMethod { get; init; }
    }
}
