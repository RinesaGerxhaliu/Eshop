namespace Catalog.Products.Features.UpdateReview;

public record UpdateProductReviewCommand(Guid ReviewId, string NewReviewText, int NewRating, string ReviewerUserName)
    : ICommand<UpdateProductReviewResponse>;

internal class UpdateProductReviewHandler(IProductReviewRepository repository)
    : ICommandHandler<UpdateProductReviewCommand, UpdateProductReviewResponse>
{
    public async Task<UpdateProductReviewResponse> Handle(UpdateProductReviewCommand command, CancellationToken cancellationToken)
    {
        var review = await repository.GetReviewById(command.ReviewId, cancellationToken);

        if (review is null)
            throw new KeyNotFoundException("Review not found.");

        if (!string.Equals(review.ReviewerUserName, command.ReviewerUserName, StringComparison.OrdinalIgnoreCase))
            throw new UnauthorizedAccessException("You are not authorized to update this review.");

        review.UpdateReview(command.NewReviewText, command.NewRating);

        await repository.UpdateReview(review, cancellationToken);

        return new UpdateProductReviewResponse(review.Id);
    }
}
