using Microsoft.EntityFrameworkCore;
using Shared.Pagination;
using Catalog.Brands.DTOs;

namespace Catalog.Brands.Features.GetBrands
{
    public record GetBrandsQuery() : IQuery<GetBrandsResult>;

    public record GetBrandsResult(List<BrandDTO> Brands);


    internal class GetBrandsHandler(CatalogDbContext dbContext)
        : IQueryHandler<GetBrandsQuery, GetBrandsResult>
    {
        public async Task<GetBrandsResult> Handle(GetBrandsQuery query, CancellationToken cancellationToken)
        {
            var brands = await dbContext.Brands.ToListAsync(cancellationToken);

            var brandDtos = brands.Adapt<List<BrandDTO>>();

            return new GetBrandsResult(brandDtos);
        }
    }
}
