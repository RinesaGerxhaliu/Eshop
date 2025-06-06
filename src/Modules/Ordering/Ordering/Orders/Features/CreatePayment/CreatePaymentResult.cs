// CreatePaymentResult.cs
namespace Ordering.Orders.Features.CreatePayment
{
    // Instead of wrapping this in a class, declare it directly at namespace scope:
    public record CreatePaymentResult(
        bool Success,
        string? ClientSecret,
        string? PaymentIntentId,
        string? ErrorMessage
    );
}
