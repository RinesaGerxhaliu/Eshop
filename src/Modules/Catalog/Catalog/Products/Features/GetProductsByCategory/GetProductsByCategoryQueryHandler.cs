namespace Catalog.Products.Features.GetProductsByCategory;

internal class GetProductsByCategoryQueryHandler(CatalogDbContext dbContext)
    : IRequestHandler<GetProductsByCategoryQuery, List<ProductDTO>>
{
    public async Task<List<ProductDTO>> Handle(GetProductsByCategoryQuery request, CancellationToken cancellationToken)
    {
        var products = await dbContext.Products
            .Include(p => p.Image)
            .Where(p => p.CategoryId == request.CategoryId)
            .Select(p => new ProductDTO
            {
                Id = p.Id,
                Name = p.Name,
                Description = p.Description,
                Price = p.Price,
                ImageUrl = p.Image != null ? p.Image.ImageUrl : null
            })
            .ToListAsync(cancellationToken);

        return products;
    }
}

