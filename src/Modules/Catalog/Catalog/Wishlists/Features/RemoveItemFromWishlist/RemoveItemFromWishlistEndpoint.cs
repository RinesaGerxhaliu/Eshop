namespace Catalog.Wishlists.Features.RemoveItemFromWishlist;

public record RemoveItemFromWishlistResponse(Guid Id);

public class RemoveItemFromWishlistEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapDelete("/wishlist/{customerId}/items/{productId}",
            async ([FromRoute] string customerId,
                   [FromRoute] Guid productId,
                   ISender sender) =>
            {
                var command = new RemoveItemFromWishlistCommand(customerId, productId);

                var result = await sender.Send(command);

                var response = result.Adapt<RemoveItemFromWishlistResponse>();

                return Results.Ok(response);
            })
        .Produces<RemoveItemFromWishlistResponse>(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status400BadRequest)
        .WithSummary("Remove Item From Wishlist")
        .WithDescription("Remove Item From Wishlist")
        .RequireAuthorization();
    }
}


