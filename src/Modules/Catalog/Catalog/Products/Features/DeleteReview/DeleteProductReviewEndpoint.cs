using Catalog.Products.Features.DeleteReview;

public class DeleteProductReviewEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapDelete("/products/reviews/{reviewId:guid}", async (Guid reviewId, ISender sender) =>
        {
            var result = await sender.Send(new DeleteProductReviewCommand(reviewId, "")); // Username is checked inside handler

            var response = result.Adapt<DeleteProductReviewResponse>();

            return Results.Ok(response);
        })
        .Produces<DeleteProductReviewResponse>(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status400BadRequest)
        .ProducesProblem(StatusCodes.Status401Unauthorized)
        .ProducesProblem(StatusCodes.Status403Forbidden)
        .ProducesProblem(StatusCodes.Status404NotFound)
        .RequireAuthorization();
    }
}

