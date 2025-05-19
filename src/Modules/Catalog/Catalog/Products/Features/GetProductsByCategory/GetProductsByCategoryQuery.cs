namespace Catalog.Products.Features.GetProductsByCategory;

public record GetProductsByCategoryQuery(Guid CategoryId) : IRequest<List<ProductDTO>>;
