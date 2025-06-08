namespace Catalog.Products.Features.DeleteReview;

public record DeleteProductReviewCommand(Guid ReviewId, string ReviewerUserName) : ICommand<DeleteProductReviewResult>;

public record DeleteProductReviewResult(bool IsSuccess);

public record DeleteProductReviewResponse(bool IsSuccess);

internal class DeleteProductReviewHandler : ICommandHandler<DeleteProductReviewCommand, DeleteProductReviewResult>
{
    private readonly IProductReviewRepository _repository;

    public DeleteProductReviewHandler(IProductReviewRepository repository)
    {
        _repository = repository;
    }

    public async Task<DeleteProductReviewResult> Handle(DeleteProductReviewCommand command, CancellationToken cancellationToken)
    {
        var review = await _repository.GetReviewById(command.ReviewId, cancellationToken);

        if (review == null)
            throw new KeyNotFoundException("Review not found.");

        await _repository.DeleteReview(review, cancellationToken);

        return new DeleteProductReviewResult(true);
    }
}
