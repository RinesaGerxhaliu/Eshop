// File: Ordering/Orders/Models/Payment.cs
using System;

namespace Ordering.Orders.Models
{
    public enum PaymentStatus
    {
        Pending,
        Succeeded,
        Failed
    }

    public enum PaymentMethodType   // E ricanavëm nga “PaymentMethod” në “PaymentMethodType”
    {
        Stripe,
        CashOnDelivery
    }

    public class Payment : Aggregate<Guid>
    {
        public Guid OrderId { get; private set; }

        // Përdorëm “PaymentMethodType” për të shmangur konfliktin me Stripe.PaymentMethod
        public PaymentMethodType Method { get; private set; }

        public string? StripePaymentIntentId { get; private set; }
        public string? ClientSecret { get; private set; }
        public decimal AmountInCurrency { get; private set; }
        public string CurrencyCode { get; private set; }
        public PaymentStatus Status { get; private set; }

        // E ricanavëm në “CreatedOn” për të mos fshehur bazën e trashëguar “CreatedAt”
        public DateTime? CreatedOn { get; private set; }

        // EF Core kërkon një konstruktor me akses “protected” (jo “private”)
        protected Payment() { }

        // Metodë “factory” për krijimin e një Payment me Stripe
        public static Payment CreateStripePayment(
            Guid paymentId,
            Guid orderId,
            string stripePaymentIntentId,
            string clientSecret,
            decimal amountInCurrency,
            string currencyCode)
        {
            return new Payment
            {
                Id = paymentId,                              // trashëgohet nga Aggregate<Guid>
                OrderId = orderId,
                Method = PaymentMethodType.Stripe,
                StripePaymentIntentId = stripePaymentIntentId,
                ClientSecret = clientSecret,
                AmountInCurrency = amountInCurrency,
                CurrencyCode = currencyCode,
                Status = PaymentStatus.Pending,
                CreatedOn = DateTime.UtcNow
            };
        }

        public void MarkAsSucceeded() => Status = PaymentStatus.Succeeded;
        public void MarkAsFailed() => Status = PaymentStatus.Failed;
    }
}
