// Features/GetProductsByNameAscending/GetProductsSortedByNameHandler.cs
using Catalog.Contracts.Products.DTOs;
using Catalog.Data;
using Mapster;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Catalog.Products.Features.GetProductsByNameAscending;

public class GetProductsSortedByNameHandler(CatalogDbContext dbContext)
    : IRequestHandler<GetProductsSortedByNameQuery, List<ProductDTO>>
{
    public async Task<List<ProductDTO>> Handle(GetProductsSortedByNameQuery request, CancellationToken cancellationToken)
    {
        var products = await dbContext.Products
            .Include(p => p.Image)
            .OrderBy(p => p.Name)
            .ToListAsync(cancellationToken);

        return products.Adapt<List<ProductDTO>>();
    }
}
