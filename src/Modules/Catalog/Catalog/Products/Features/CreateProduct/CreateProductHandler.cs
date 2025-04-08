namespace Catalog.Products.Features.CreateProduct
{

    public record CreateProductCommand(ProductDTO Product) 
        : ICommand<CreateProductResult>;

    public record CreateProductResult(Guid Id);
    public class CreateProductCommandValidator : AbstractValidator<CreateProductCommand>
    {
        public CreateProductCommandValidator() 
        {
            RuleFor(x => x.Product.Name).NotEmpty().WithMessage("Name is required");
            RuleFor(x => x.Product.Price).GreaterThan(0).WithMessage("Price must be greater than 0");

        }
    }

    internal class CreateProductHandler
        (CatalogDbContext dbContext, 
        ILogger<CreateProductHandler> logger)
        : ICommandHandler<CreateProductCommand, CreateProductResult>
    {

        public async Task<CreateProductResult> Handle(CreateProductCommand command,
        CancellationToken cancellationToken)
        {

            //logging part
            logger.LogInformation("CreateProductCommandHandler.Handle called with {@Command}", command);

            //actual business logic part
            var product = CreateNewProduct(command.Product);

            dbContext.Products.Add(product);
            await dbContext.SaveChangesAsync(cancellationToken);

            return new CreateProductResult(product.Id);
       
        }

        private Product CreateNewProduct(ProductDTO productDto)
        {
            var product = Product.Create(
                Guid.NewGuid(),
                productDto.Name,
                productDto.Description,
                productDto.Price
            );

            return product;
        }

    }
}
