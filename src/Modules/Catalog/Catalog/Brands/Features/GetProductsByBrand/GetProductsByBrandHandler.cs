using MediatR;
using Catalog.Contracts.Products;
using Catalog.Data;
using Mapster;
using Microsoft.EntityFrameworkCore;

namespace Catalog.Brands.Features.GetProductsByBrand;

internal sealed class GetProductsByBrandHandler(CatalogDbContext dbContext)
    : IRequestHandler<GetProductsByBrandQuery, List<ProductDTO>>
{
    public async Task<List<ProductDTO>> Handle(GetProductsByBrandQuery request, CancellationToken cancellationToken)
    {
        var products = await dbContext.Products
            .Where(p => p.BrandId == request.BrandId)
            .Include(p => p.Image) // optional: if your ProductDTO uses image URL
            .ToListAsync(cancellationToken);

        return products.Adapt<List<ProductDTO>>();
    }
}

