using FluentValidation;
using Ordering.Orders.Models;

namespace Ordering.Orders.Features.UpdateShippingMethod;

public record UpdateShippingMethodCommand(Guid Id, string Name, decimal Cost) : ICommand<bool>;

public class UpdateShippingMethodCommandValidator : AbstractValidator<UpdateShippingMethodCommand>
{
    public UpdateShippingMethodCommandValidator()
    {
        RuleFor(x => x.Name).NotEmpty();
        RuleFor(x => x.Cost).GreaterThanOrEqualTo(0);
    }
}

internal class UpdateShippingMethodHandler(OrderingDbContext dbContext)
    : ICommandHandler<UpdateShippingMethodCommand, bool>
{
    public async Task<bool> Handle(UpdateShippingMethodCommand command, CancellationToken cancellationToken)
    {
        var method = await dbContext.ShippingMethods.FindAsync(command.Id);
        if (method == null)
            return false;

        method.Update(command.Name, command.Cost);

        await dbContext.SaveChangesAsync(cancellationToken);
        return true;
    }

}
