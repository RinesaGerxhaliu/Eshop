namespace Catalog.Products.Features.GetAvarageReview;

public record GetAverageRatingQuery(Guid ProductId) : IQuery<GetAverageRatingResponse>;

public record GetAverageRatingResponse(Guid ProductId, double AverageRating);

internal class GetAverageRatingHandler(IProductReviewRepository repository)
    : IQueryHandler<GetAverageRatingQuery, GetAverageRatingResponse>
{
    public async Task<GetAverageRatingResponse> Handle(GetAverageRatingQuery query, CancellationToken cancellationToken)
    {
        var average = await repository.GetAverageRatingByProductId(query.ProductId, cancellationToken);
        return new GetAverageRatingResponse(query.ProductId, average);
    }
}
