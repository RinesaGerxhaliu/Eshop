using System.Security.Claims;
using MediatR;
using Mapster;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace Catalog.Products.Features.DeleteReview;

public record DeleteProductReviewCommand(Guid ReviewId, string ReviewerUserName) : ICommand<DeleteProductReviewResult>;

public record DeleteProductReviewResult(bool IsSuccess);

public record DeleteProductReviewResponse(bool IsSuccess);

internal class DeleteProductReviewHandler(IProductReviewRepository repository, IHttpContextAccessor httpContextAccessor)
    : ICommandHandler<DeleteProductReviewCommand, DeleteProductReviewResult>
{
    public async Task<DeleteProductReviewResult> Handle(DeleteProductReviewCommand command, CancellationToken cancellationToken)
    {
        var review = await repository.GetReviewById(command.ReviewId, cancellationToken);

        if (review is null)
            throw new KeyNotFoundException("Review not found.");

        var userName = httpContextAccessor.HttpContext?.User.FindFirst("preferred_username")?.Value;

        if (string.IsNullOrWhiteSpace(userName) || !string.Equals(review.ReviewerUserName, userName, StringComparison.OrdinalIgnoreCase))
            throw new UnauthorizedAccessException("You are not authorized to delete this review.");

        await repository.DeleteReview(review, cancellationToken);

        return new DeleteProductReviewResult(true);
    }
}