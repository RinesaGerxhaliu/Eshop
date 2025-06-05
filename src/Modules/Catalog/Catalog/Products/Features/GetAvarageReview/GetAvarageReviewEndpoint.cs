namespace Catalog.Products.Features.GetAvarageReview;

public class GetAverageRatingEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGet("/products/{productId:guid}/average-rating", async (Guid productId, ISender sender, CancellationToken cancellationToken) =>
        {
            var result = await sender.Send(new GetAverageRatingQuery(productId), cancellationToken);
            return Results.Ok(result);
        })
        .Produces<GetAverageRatingResponse>(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status400BadRequest)
        .WithSummary("Get Product Average Rating")
        .WithDescription("Returns only the average rating for a given product.");
    }
}



