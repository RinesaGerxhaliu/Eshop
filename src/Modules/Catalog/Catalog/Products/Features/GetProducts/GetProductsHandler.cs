using Shared.Pagination;

namespace Catalog.Products.Features.GetProducts
{
    public record GetProductsQuery(
        PaginationRequest PaginationRequest,
        Guid? CategoryId,
        Guid? BrandId
    ) : IQuery<GetProductsResult>;

    public record GetProductsResult(PaginatedResult<ProductDTO> Products);

    internal class GetProductsHandler
        : IQueryHandler<GetProductsQuery, GetProductsResult>
    {
        private readonly CatalogDbContext _db;

        public GetProductsHandler(CatalogDbContext db) => _db = db;

        public async Task<GetProductsResult> Handle(GetProductsQuery q, CancellationToken ct)
        {
            // 1) start query
            var query = _db.Products
                .AsNoTracking()
                .Include(p => p.Image)
                .AsQueryable();

            // 2) apply filters
            if (q.CategoryId.HasValue)
                query = query.Where(p => p.CategoryId == q.CategoryId.Value);
            if (q.BrandId.HasValue)
                query = query.Where(p => p.BrandId == q.BrandId.Value);

            // 3) total count before paging
            var total = await query.LongCountAsync(ct);

            // 4) fetch the page
            var entities = await query
                .OrderBy(p => p.Name)
                .Skip(q.PaginationRequest.PageIndex * q.PaginationRequest.PageSize)
                .Take(q.PaginationRequest.PageSize)
                .ToListAsync(ct);

            // 5) map to DTO
            var dtos = entities.Adapt<List<ProductDTO>>();

            // 6) return paginated result
            var page = new PaginatedResult<ProductDTO>(
                q.PaginationRequest.PageIndex,
                q.PaginationRequest.PageSize,
                total,
                dtos
            );

            return new GetProductsResult(page);
        }
    }
}
