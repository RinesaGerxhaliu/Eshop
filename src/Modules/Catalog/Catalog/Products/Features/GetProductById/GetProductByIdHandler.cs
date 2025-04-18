namespace Catalog.Products.Features.GetProductById
{
    internal class GetProductByIdHandler(
            IProductRepository repository
        ) : IQueryHandler<GetProductByIdQuery, GetProductByIdResult>
    {
        public async Task<GetProductByIdResult> Handle(
            GetProductByIdQuery query,
            CancellationToken cancellationToken)
        {
            var product = await repository.GetByIdAsync(query.Id, cancellationToken)
                          ?? throw new ProductNotFoundException(query.Id);

            var dto = product.Adapt<ProductDTO>();
            return new GetProductByIdResult(dto);
        }
    }
}
