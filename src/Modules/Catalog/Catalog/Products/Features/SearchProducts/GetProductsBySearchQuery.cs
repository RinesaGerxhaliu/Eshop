using Catalog.Contracts.Products;
using Shared.Pagination;

namespace Catalog.Products.Features.Search;

public record GetProductsBySearchQuery(string Query) : IQuery<List<ProductDTO>>;
