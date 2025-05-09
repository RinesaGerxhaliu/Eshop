using Catalog.Contracts.Products;
using Catalog.Data;
using Catalog.Products.Features.GetProductsByPrice;
using Mapster;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Catalog.Products.Features.GetProductsByPriceDescending;

public sealed class GetProductsSortedByPriceDescendingHandler(CatalogDbContext dbContext)
    : IRequestHandler<GetProductsSortedByPriceDescendingQuery, List<ProductDTO>>
{
    public async Task<List<ProductDTO>> Handle(GetProductsSortedByPriceDescendingQuery request, CancellationToken cancellationToken)
    {
        var products = await dbContext.Products
            .Include(p => p.Image)
            .OrderByDescending(p => p.Price) 
            .ToListAsync(cancellationToken);

        return products.Adapt<List<ProductDTO>>();
    }
}
