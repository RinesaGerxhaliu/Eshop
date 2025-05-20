namespace Catalog.Products.Features.GetProductsByCategory;

public record GetProductsByCategoryQuery(Guid CategoryId, int PageIndex, int PageSize) : IRequest<PaginatedProductsDTO>;

