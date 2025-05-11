using Catalog.Contracts.Products;
using Shared.Pagination;

namespace Catalog.Products.Features.Search;

public record GetProductsBySearchQuery(
    string Query,
    Guid? CategoryId,
    decimal? MinPrice,
    decimal? MaxPrice,
    Guid? BrandId
) : IQuery<List<ProductDTO>>;

