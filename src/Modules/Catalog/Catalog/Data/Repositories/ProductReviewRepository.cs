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
    }


