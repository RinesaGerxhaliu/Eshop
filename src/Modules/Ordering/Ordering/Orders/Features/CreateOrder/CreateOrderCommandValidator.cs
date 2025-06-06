namespace Ordering.Orders.Features.CreateOrder;

public class CreateOrderCommandValidator : AbstractValidator<CreateOrderCommand>
{
    public CreateOrderCommandValidator()
    {
        RuleFor(x => x.Order.Items)
            .NotEmpty().WithMessage("Order must have at least one item");

        RuleFor(x => x.Order.ShippingMethodId)
            .NotEmpty().WithMessage("Shipping method is required");

        RuleFor(x => x.Order)
            .Must(order =>
                order.SavedAddressId != null || order.ShippingAddress != null)
            .WithMessage("Shipping address is required (either SavedAddressId or ShippingAddress)");
    }
}
