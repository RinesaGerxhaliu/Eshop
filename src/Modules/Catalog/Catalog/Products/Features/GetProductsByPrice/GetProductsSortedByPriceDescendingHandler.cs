using Catalog.Contracts.Products;
using Catalog.Data;
using Catalog.Products.Features.GetProductsByPrice;
using Mapster;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Catalog.Products.Features.GetProductsByPriceDescending;

internal sealed class GetProductsSortedByPriceDescendingHandler(CatalogDbContext dbContext)
    : IRequestHandler<GetProductsSortedByPriceQuery, List<ProductDTO>>
{
    public async Task<List<ProductDTO>> Handle(GetProductsSortedByPriceQuery request, CancellationToken cancellationToken)
    {
        var products = await dbContext.Products
            .Include(p => p.Image)
            .OrderByDescending(p => p.Price) // Sort by price descending
            .ToListAsync(cancellationToken);

        return products.Adapt<List<ProductDTO>>();
    }
}


//namespace Catalog.Products.Features.GetProductsByPrice;


