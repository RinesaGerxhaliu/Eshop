using Ordering.Orders.Dtos;

namespace Ordering.Orders.Features.CreateOrder;

public record CreateOrderCommand(OrderDto Order)
    : ICommand<CreateOrderResult>;
public record CreateOrderResult(Guid Id);
public class CreateOrderCommandValidator : AbstractValidator<CreateOrderCommand>
{
    public CreateOrderCommandValidator()
    {
        RuleFor(x => x.Order.OrderName).NotEmpty().WithMessage("OrderName is required");
    }
}

internal class CreateOrderHandler(OrderingDbContext dbContext)
    : ICommandHandler<CreateOrderCommand, CreateOrderResult>
{
    public async Task<CreateOrderResult> Handle(CreateOrderCommand command, CancellationToken cancellationToken)
    {
        var order = CreateNewOrder(command.Order);

        dbContext.Orders.Add(order);
        await dbContext.SaveChangesAsync(cancellationToken);

        return new CreateOrderResult(order.Id);
    }

    private Order CreateNewOrder(OrderDto orderDto)
    {
       

        var newOrder = Order.Create(
                id: Guid.NewGuid(),
                customerId: orderDto.CustomerId,
                orderName: $"{orderDto.OrderName}_{new Random().Next()}"
                );

        orderDto.Items.ForEach(item =>
        {
            newOrder.Add(
                item.ProductId,
                item.Quantity,
                item.Price);
        });

        return newOrder;
    }
}