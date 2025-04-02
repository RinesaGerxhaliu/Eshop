namespace Catalog.Products.Features.GetProducts
{
    public record GetProductsQuery()
        : IQuery<GetProductsResult>;

    public record GetProductsResult(IEnumerable<ProductDTO> Products);
    internal class GetProductsHandler(CatalogDbContext dbContext)
        : IQueryHandler<GetProductsQuery, GetProductsResult>
    {
        public async Task<GetProductsResult> Handle(GetProductsQuery query, 
            CancellationToken cancellationToken)
        {
            var products = await dbContext.Products
                .AsNoTracking()
                .OrderBy(p => p.Name)
                .ToListAsync(cancellationToken);

            // mapping product entity to productdto
            var productDtos = products.Adapt<List<ProductDTO>>();

            return new GetProductsResult(productDtos);
        }
    }
}
