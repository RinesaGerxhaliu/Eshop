namespace Catalog.Products.Features.UpdateProduct;

public record UpdateProductCommand(ProductDTO Product)
    : ICommand<UpdateProductResult>;

public record UpdateProductResult(bool IsSuccessful);

public class UpdateProductCommandValidator : AbstractValidator<UpdateProductCommand> 
{
    public UpdateProductCommandValidator() 
    {
        RuleFor(x => x.Product.Id).NotEmpty().WithMessage("Id is required");
        RuleFor(x => x.Product.Name).NotEmpty().WithMessage("Name is required");
        RuleFor(x => x.Product.Price).GreaterThan(0).WithMessage("Price must be greater than 0");
        // ← new rules:
        RuleFor(x => x.Product.CategoryId)
            .NotEmpty().WithMessage("Category is required");
        RuleFor(x => x.Product.BrandId)
            .NotEmpty().WithMessage("Brand is required");
    }

}
internal class UpdateProductHandler : ICommandHandler<UpdateProductCommand, UpdateProductResult>
{
    private readonly CatalogDbContext _dbContext;

    public UpdateProductHandler(CatalogDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<UpdateProductResult> Handle(UpdateProductCommand command,
        CancellationToken cancellationToken)
    {
        var product = await _dbContext.Products
          .FindAsync(command.Product.Id, cancellationToken);

        if (product is null)
        {
            throw new ProductNotFoundException(command.Product.Id);
        }

        UpdateProductWithNewValues(product, command.Product);

        _dbContext.Products.Update(product);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return new UpdateProductResult(true);
    }

    private void UpdateProductWithNewValues(Product product, ProductDTO productDTO)
    {
        product.Update(
            productDTO.Name,
            productDTO.Description,
            productDTO.Price,
            productDTO.CategoryId,
            productDTO.BrandId
        );
    }
}
