using MediatR;
using Catalog.Contracts.Products;

namespace Catalog.Brands.Features.GetProductsByBrand;
public record GetProductsByBrandQuery(Guid BrandId) : IRequest<List<ProductDTO>>;
