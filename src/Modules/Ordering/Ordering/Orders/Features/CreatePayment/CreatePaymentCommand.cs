// CreatePaymentCommand.cs
using MediatR;

namespace Ordering.Orders.Features.CreatePayment
{
    // Remove the outer “CreatePaymentCommand” class; declare the record directly:
    public record CreatePaymentCommand(
        Guid OrderId,
        Guid ShippingMethodId,
        string? CurrencyCode
    ) : IRequest<CreatePaymentResult>;
}
