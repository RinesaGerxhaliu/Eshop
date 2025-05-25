namespace Ordering.Orders.Features.CreateShippingMethod;

public record CreateShippingMethodCommand(ShippingMethodDto ShippingMethod)
    : ICommand<CreateShippingMethodResult>;

public record CreateShippingMethodResult(Guid Id);

public class CreateShippingMethodCommandValidator : AbstractValidator<CreateShippingMethodCommand>
{
    public CreateShippingMethodCommandValidator()
    {
        RuleFor(x => x.ShippingMethod.Name)
            .NotEmpty().WithMessage("Name is required");

        RuleFor(x => x.ShippingMethod.Cost)
            .GreaterThanOrEqualTo(0).WithMessage("Cost must be non-negative");
    }
}

internal class CreateShippingMethodHandler(OrderingDbContext dbContext)
    : ICommandHandler<CreateShippingMethodCommand, CreateShippingMethodResult>
{
    public async Task<CreateShippingMethodResult> Handle(CreateShippingMethodCommand command, CancellationToken cancellationToken)
    {
        var dto = command.ShippingMethod;

        var method = ShippingMethod.Create(
            id: Guid.NewGuid(),
            name: dto.Name,
            cost: dto.Cost
        );

        dbContext.ShippingMethods.Add(method);
        await dbContext.SaveChangesAsync(cancellationToken);

        return new CreateShippingMethodResult(method.Id);
    }
}
