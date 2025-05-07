using MediatR;
using Catalog.Contracts.Review.DTOs;

namespace Catalog.Products.Features.GetProductReviews;

public record GetProductReviewsQuery(Guid ProductId) : IRequest<List<ReviewDTO>>;
