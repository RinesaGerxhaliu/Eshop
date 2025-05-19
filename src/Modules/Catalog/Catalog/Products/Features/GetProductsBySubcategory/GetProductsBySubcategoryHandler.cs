namespace Catalog.Products.Features.GetProductsBySubcategory;

public record GetProductsBySubcategoryQuery(Guid SubcategoryId)
    : IRequest<List<ProductDTO>>;

internal class GetProductsBySubcategoryQueryHandler : IRequestHandler<GetProductsBySubcategoryQuery, List<ProductDTO>>
{
    private readonly CatalogDbContext _db;

    public GetProductsBySubcategoryQueryHandler(CatalogDbContext db)
        => _db = db;

    public async Task<List<ProductDTO>> Handle(GetProductsBySubcategoryQuery request, CancellationToken cancellationToken)
    {
        return await _db.Products
            .Include(p => p.Image)
            .Where(p => p.SubcategoryId == request.SubcategoryId)
            .Select(p => new ProductDTO
            {
                Id = p.Id,
                Name = p.Name,
                Description = p.Description,
                Price = p.Price,
                ImageUrl = p.Image != null ? p.Image.ImageUrl : null
            })
            .ToListAsync(cancellationToken);
    }
}