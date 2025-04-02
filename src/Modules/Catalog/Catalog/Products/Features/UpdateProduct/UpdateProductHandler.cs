namespace Catalog.Products.Features.UpdateProduct;

public record UpdateProductCommand(ProductDTO product)
    : ICommand<UpdateProductResult>;

public record UpdateProductResult(bool IsSuccessful);

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
          .FindAsync(command.product.Id, cancellationToken);

        if (product is null)
        {
            throw new Exception($"Product not found: {command.product.Id}");
        }

        UpdateProductWithNewValues(product, command.product);

        _dbContext.Products.Update(product);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return new UpdateProductResult(true);
    }

    private void UpdateProductWithNewValues(Product product, ProductDTO productDTO)
    {
        product.Update(
            productDTO.Name,
            productDTO.Description,
            productDTO.Price
        );
    }
}
