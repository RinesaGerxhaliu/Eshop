using Catalog.Products.Models;
using Mapster;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Catalog.Products.Features.GetProducts;

public record GetNewestProductsQuery : IQuery<List<ProductDTO>>;

internal class GetNewestProductsHandler : IQueryHandler<GetNewestProductsQuery, List<ProductDTO>>
{
    private readonly CatalogDbContext _db;

    public GetNewestProductsHandler(CatalogDbContext db) => _db = db;

    public async Task<List<ProductDTO>> Handle(GetNewestProductsQuery request, CancellationToken ct)
    {
        var products = await _db.Products
            .AsNoTracking()
            .Include(p => p.Image)
            .OrderByDescending(p => p.CreatedAt)
            .Take(4)
            .ToListAsync();

        return products.Adapt<List<ProductDTO>>();
    }
}
