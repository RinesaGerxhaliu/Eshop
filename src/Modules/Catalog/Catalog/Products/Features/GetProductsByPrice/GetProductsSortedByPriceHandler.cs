using Catalog.Contracts.Products.DTOs;
using Catalog.Data;
using Mapster;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Catalog.Products.Features.GetProductsByPrice;

internal sealed class GetProductsSortedByPriceHandler(CatalogDbContext dbContext)
    : IRequestHandler<GetProductsSortedByPriceQuery, List<ProductDTO>>
{
    public async Task<List<ProductDTO>> Handle(GetProductsSortedByPriceQuery request, CancellationToken cancellationToken)
    {
        var products = await dbContext.Products
            .Include(p => p.Image)
            .OrderBy(p => p.Price)
            .ToListAsync(cancellationToken);

        return products.Adapt<List<ProductDTO>>();
    }
}


