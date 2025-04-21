namespace Catalog.Data.Repositories;
    public class ProductReviewRepository : IProductReviewRepository
    {
        private readonly CatalogDbContext _dbContext;

        public ProductReviewRepository(CatalogDbContext dbContext) => _dbContext = dbContext;

        // Method to create a review for a product
        public async Task CreateReview(ProductReview review, CancellationToken ct)
        {
            // Add the review to the DbContext
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






}


