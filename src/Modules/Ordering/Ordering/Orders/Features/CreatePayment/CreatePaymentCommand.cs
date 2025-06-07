using Ordering.Orders.Features.CreatePayment;

public class CreatePaymentCommand : IRequest<CreatePaymentResult>
{
    public DraftOrderDto Order { get; set; } = default!;
    public string? CurrencyCode { get; set; }
}
