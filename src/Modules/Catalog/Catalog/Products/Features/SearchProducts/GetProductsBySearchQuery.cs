using Catalog.Contracts.Products;
using Shared.Pagination;

namespace Catalog.Products.Features.Search;

public record GetProductsBySearchQuery(
       string Query,
       PaginationRequest PaginationRequest,
       Guid? CategoryId = null,
       decimal? MinPrice = null,
       decimal? MaxPrice = null,
       Guid? BrandId = null
   ) : IQuery<PaginatedResult<ProductDTO>>;
