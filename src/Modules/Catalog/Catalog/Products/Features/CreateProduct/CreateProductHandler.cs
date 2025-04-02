namespace Catalog.Products.Features.CreateProduct
{

    public record CreateProductCommand(ProductDTO Product) 
        : ICommand<CreateProductResult>;

    public record CreateProductResult(Guid Id);

    internal class CreateProductHandler(CatalogDbContext dbContext)
        : ICommandHandler<CreateProductCommand, CreateProductResult>
    {

        public async Task<CreateProductResult> Handle(CreateProductCommand command,
        CancellationToken cancellationToken)
        {
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
