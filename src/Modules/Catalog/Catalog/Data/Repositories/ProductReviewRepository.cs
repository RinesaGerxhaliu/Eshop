using Shared.Pagination;

namespace Catalog.Data.Repositories;
    public class ProductReviewRepository : IProductReviewRepository
    {
        private readonly CatalogDbContext _dbContext;

        public ProductReviewRepository(CatalogDbContext dbContext) => _dbContext = dbContext;

        public async Task CreateReview(ProductReview review, CancellationToken ct)
        {
            await _dbContext.ProductReviews.AddAsync(review, ct);
            await _dbContext.SaveChangesAsync(ct);
        }

        public async Task<ProductReview?> GetReviewById(Guid reviewId, CancellationToken ct)
        {
            return await _dbContext.ProductReviews.FirstOrDefaultAsync(r => r.Id == reviewId, ct);
        }
        public async Task UpdateReview(ProductReview review, CancellationToken ct)
        {
            _dbContext.ProductReviews.Update(review);
            await _dbContext.SaveChangesAsync(ct);
        }

        public async Task DeleteReview(ProductReview review, CancellationToken ct)
        {
            _dbContext.ProductReviews.Remove(review);
            await _dbContext.SaveChangesAsync(ct);
        }

        public async Task<List<ProductReview>> GetReviewsByProductId(Guid productId, CancellationToken ct)
        {
             return await _dbContext.ProductReviews
                .Where(r => r.ProductId == productId)
                .ToListAsync(ct);
        }

    public async Task<PaginatedResult<ProductReview>> GetAllReviewsAsync(
    PaginationRequest pagination,
    Guid? productId,
    CancellationToken ct)
    {
        var query = _dbContext.ProductReviews
            .AsNoTracking()
            .AsQueryable();

        if (productId.HasValue)
            query = query.Where(r => r.ProductId == productId.Value);

        var total = await query.LongCountAsync(ct);

        var items = await query
            .OrderByDescending(r => r.CreatedAt)
            .Skip(pagination.PageIndex * pagination.PageSize)
            .Take(pagination.PageSize)
            .ToListAsync(ct);

        return new PaginatedResult<ProductReview>(
            pagination.PageIndex,
            pagination.PageSize,
            total,
            items
        );
    }
    public async Task<double> GetAverageRatingByProductId(Guid productId, CancellationToken ct)
    {
        var ratings = await _dbContext.ProductReviews
            .Where(r => r.ProductId == productId)
            .Select(r => r.Rating)
            .ToListAsync(ct);

        if (ratings.Count == 0)
            return 0;

        return Math.Round(ratings.Average(), 2);
    }


}


