using Shared.Pagination;

namespace Catalog.Data.Repositories;

public interface IProductReviewRepository
{
    Task CreateReview(ProductReview review, CancellationToken cancellationToken);
    Task<ProductReview?> GetReviewById(Guid reviewId, CancellationToken cancellationToken);
    Task UpdateReview(ProductReview review, CancellationToken cancellationToken);
    Task DeleteReview(ProductReview review, CancellationToken cancellationToken);
    Task<List<ProductReview>> GetReviewsByProductId(Guid productId, CancellationToken cancellationToken);
    Task<PaginatedResult<ProductReview>> GetAllReviewsAsync(
            PaginationRequest pagination,
            Guid? productId,
            CancellationToken cancellationToken);

}



