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
            RuleFor(x => x.Product.CategoryId)
                .NotEqual(Guid.Empty).WithMessage("Category is required");
            RuleFor(x => x.Product.BrandId)
                .NotEqual(Guid.Empty).WithMessage("Brand is required");
        }
    }

    internal class CreateProductHandler
        (IProductRepository products)
        : ICommandHandler<CreateProductCommand, CreateProductResult>
    {

        public async Task<CreateProductResult> Handle(CreateProductCommand command,
        CancellationToken cancellationToken)
        {
            var product = CreateNewProduct(command.Product);

            await products.AddAsync(product, cancellationToken);

            return new CreateProductResult(product.Id);
       
        }

        private Product CreateNewProduct(ProductDTO dto)
        {
            var product = Product.Create(
                Guid.NewGuid(),
                dto.Name,
                dto.Description,
                dto.Price,
                dto.CategoryId,
                dto.BrandId
            );

            return product;
        }

    }
}
