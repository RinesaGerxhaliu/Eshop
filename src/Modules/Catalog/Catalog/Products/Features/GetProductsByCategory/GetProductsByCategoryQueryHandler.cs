namespace Catalog.Products.Features.GetProductsByCategory;

public record PaginatedProductsDTO(int TotalCount, List<ProductDTO> Items);

internal class GetProductsByCategoryQueryHandler(CatalogDbContext dbContext)
    : IRequestHandler<GetProductsByCategoryQuery, PaginatedProductsDTO>
{
    public async Task<PaginatedProductsDTO> Handle(GetProductsByCategoryQuery request, CancellationToken cancellationToken)
    {
        var query = dbContext.Products
            .Include(p => p.Image)
            .Where(p => p.CategoryId == request.CategoryId);

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderBy(p => p.Name) // Opsionale: rendit produktet sipas emrit
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

