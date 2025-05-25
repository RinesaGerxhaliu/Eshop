namespace Catalog.Brands.Features.GetProductsByBrand;
public record GetProductsByBrandQuery(Guid BrandId, int PageIndex, int PageSize) : IRequest<PaginatedProductsDTO>;
