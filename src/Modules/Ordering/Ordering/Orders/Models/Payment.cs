namespace Ordering.Orders.Models
{
    public enum PaymentStatus
    {
        Pending,
        Succeeded,
        Failed
    }
    public class Payment : Aggregate<Guid>
    {
        public Guid OrderId { get; private set; }
        public string StripePaymentIntentId { get; private set; } = default!;
        public decimal AmountInCurrency { get; private set; }
        public string CurrencyCode { get; private set; } = default!;
        public PaymentStatus Status { get; private set; }
        public DateTime? CreatedAt { get; private set; }

        private Payment() {}
    }

}
