namespace Ordering.Orders.Features.CreatePayment
{
    public class CreatePaymentResponse
    {
        public string ClientSecret { get; set; } = default!;
        public string? PaymentIntentId { get; set; }
    }
}
