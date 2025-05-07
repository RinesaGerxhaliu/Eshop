using MediatR;
using Catalog.Contracts.Products;

namespace Catalog.Categories.Features.GetProductsByCategory;

public record GetProductsByCategoryQuery(Guid CategoryId) : IRequest<List<ProductDTO>>;
