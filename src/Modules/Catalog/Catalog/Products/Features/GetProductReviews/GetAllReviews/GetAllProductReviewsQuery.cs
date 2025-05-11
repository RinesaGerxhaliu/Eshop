using Catalog.Contracts.Review.DTOs;

namespace Catalog.Products.Features.GetProductReviews.GetAllReviews;

public record GetProductReviewsQuery(Guid ProductId) : IRequest<List<ReviewDTO>>;
