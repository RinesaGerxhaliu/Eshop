using Microsoft.EntityFrameworkCore;
using Shared.Pagination;
using Catalog.Brands.DTOs;

namespace Catalog.Brands.Features.GetBrands
{
    public record GetBrandsQuery(PaginationRequest PaginationRequest) : IQuery<GetBrandsResult>;

    public record GetBrandsResult(PaginatedResult<BrandDTO> Brands);



    internal class GetBrandsHandler(CatalogDbContext dbContext)
        : IQueryHandler<GetBrandsQuery, GetBrandsResult>
    {
        public async Task<GetBrandsResult> Handle(GetBrandsQuery q, CancellationToken ct)
        {
            var query = dbContext.Brands
                .AsNoTracking()
                .AsQueryable();

            var total = await query.LongCountAsync(ct);

            var entities = await query
                .OrderBy(b => b.Name)
                .Skip(q.PaginationRequest.PageIndex * q.PaginationRequest.PageSize)
                .Take(q.PaginationRequest.PageSize)
                .ToListAsync(ct);

            var dtos = entities.Adapt<List<BrandDTO>>();

            var page = new PaginatedResult<BrandDTO>(
                q.PaginationRequest.PageIndex,
                q.PaginationRequest.PageSize,
                total,
                dtos
            );

            return new GetBrandsResult(page);
        }
    }
}
