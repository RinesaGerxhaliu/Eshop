﻿using static Microsoft.EntityFrameworkCore.DbLoggerCategory.Database;

namespace Catalog.Products.Features.GetProductById
{
    public record GetProductByIdQuery(Guid Id)
        : IQuery<GetProductByIdResult>;

    public record GetProductByIdResult
    {
        public ProductDTO Product { get; init; }

        public GetProductByIdResult(ProductDTO product)
        {
            Product = product;
        }
    }

    internal class GetProductsHandler(CatalogDbContext dbContext)
        : IQueryHandler<GetProductByIdQuery, GetProductByIdResult>
    {
        public async Task<GetProductByIdResult> Handle(GetProductByIdQuery query,
            CancellationToken cancellationToken)
        {
            var product = await dbContext.Products
                             .AsNoTracking()
                             .SingleOrDefaultAsync(p => p.Id == query.Id, cancellationToken);

            if (product is null)
            {
                throw new ProductNotFoundException(query.Id);
            }

            // mapping product entity to productdto
            var productDto = product.Adapt<ProductDTO>();

            return new GetProductByIdResult(productDto);
        }
    }
}
