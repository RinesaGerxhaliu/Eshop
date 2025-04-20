namespace Catalog.Data.Repositories;

    public interface IProductReviewRepository
    {
        Task CreateReview(ProductReview review, CancellationToken cancellationToken);
    }


