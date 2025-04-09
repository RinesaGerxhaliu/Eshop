namespace Basket.Basket.Features.CreateBasket
{
    public record CreateBasketCommand(ShoppingCartDTO ShoppingCart)
    : ICommand<CreateBasketResult>;
    public record CreateBasketResult(Guid Id);
    public class CreateBasketCommandValidator : AbstractValidator<CreateBasketCommand>
    {
        public CreateBasketCommandValidator()
        {
            RuleFor(x => x.ShoppingCart.UserName).NotEmpty().WithMessage("UserName is required");
        }
    }
    internal class CreateBasketHandler(BasketDbContext dbContext)
    : ICommandHandler<CreateBasketCommand, CreateBasketResult>
    {
        //this method act as a mediator between the incoming command object and the domain model
        public async Task<CreateBasketResult> Handle(CreateBasketCommand command, CancellationToken cancellationToken)
        {
        
            var shoppingCart = CreateNewBasket(command.ShoppingCart);

            dbContext.ShoppingCarts.Add(shoppingCart);
            await dbContext.SaveChangesAsync(cancellationToken);

            return new CreateBasketResult(shoppingCart.Id);
        }

        private ShoppingCart CreateNewBasket(ShoppingCartDTO shoppingCartDto)
        {
            // create new basket
            var newBasket = ShoppingCart.Create(
                Guid.NewGuid(),
                shoppingCartDto.UserName);

            shoppingCartDto.Items.ForEach(item =>
            {
                newBasket.AddItem(
                    item.ProductId,
                    item.Quantity,
                    item.Color,
                    item.Price,
                    item.ProductName);
            });

            return newBasket;
        }
    }
}