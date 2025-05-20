using MediatR;
using Catalog.Contracts.Products;
using Catalog.Data;
using Mapster;
using Microsoft.EntityFrameworkCore;

namespace Catalog.Brands.Features.GetProductsByBrand;

public record PaginatedProductsDTO(int TotalCount, List<ProductDTO> Items);
internal sealed class GetProductsByBrandQueryHandler(CatalogDbContext dbContext)
    : IRequestHandler<GetProductsByBrandQuery, PaginatedProductsDTO>
{
    public async Task<PaginatedProductsDTO> Handle(GetProductsByBrandQuery request, CancellationToken cancellationToken)
    {
        var query = dbContext.Products
            .Include(p => p.Image)
            .Where(p => p.BrandId == request.BrandId);

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderBy(p => p.Name)  
            .Skip(request.PageIndex * request.PageSize)
            .Take(request.PageSize)
            .Select(p => new ProductDTO
            {
                Id = p.Id,
                Name = p.Name,
                Description = p.Description,
                Price = p.Price,
                ImageUrl = p.Image != null ? p.Image.ImageUrl : null
            })
            .ToListAsync(cancellationToken);

        return new PaginatedProductsDTO(totalCount, items);
    }
}
