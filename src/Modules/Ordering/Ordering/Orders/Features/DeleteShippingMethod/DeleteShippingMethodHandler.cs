using Ordering.Orders.Models;

namespace Ordering.Orders.Features.DeleteShippingMethod;

public record DeleteShippingMethodCommand(Guid Id) : ICommand<bool>;

internal class DeleteShippingMethodHandler(OrderingDbContext dbContext)
    : ICommandHandler<DeleteShippingMethodCommand, bool>
{
    public async Task<bool> Handle(DeleteShippingMethodCommand command, CancellationToken cancellationToken)
    {
        var method = await dbContext.ShippingMethods.FindAsync(command.Id);
        if (method == null)
            return false;

        dbContext.ShippingMethods.Remove(method);
        await dbContext.SaveChangesAsync(cancellationToken);

        return true;
    }
}
