namespace Catalog.Products.Features.AddReview;

public record CreateProductReviewCommand(Guid ProductId, Guid ReviewerUserId, string ReviewText, int Rating, string ReviewerUserName)
    : ICommand<CreateProductReviewResponse>;

internal class CreateProductReviewHandler(IProductReviewRepository repository)
    : ICommandHandler<CreateProductReviewCommand, CreateProductReviewResponse>
{
    public async Task<CreateProductReviewResponse> Handle(CreateProductReviewCommand command, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(command.ReviewerUserName))
            throw new ArgumentException("ReviewerUserName is required.");

        if (string.IsNullOrWhiteSpace(command.ReviewText))
            throw new ArgumentException("ReviewText is required.");

        if (command.Rating is < 1 or > 5)
            throw new ArgumentOutOfRangeException(nameof(command.Rating), "Rating must be between 1 and 5.");

        var productReview = ProductReview.Create(
            Guid.NewGuid(),
            command.ProductId,
            command.ReviewerUserId,
            command.ReviewerUserName,
            command.ReviewText,
            command.Rating
        );

        await repository.CreateReview(productReview, cancellationToken);

        return new CreateProductReviewResponse(productReview.Id);
    }
}
