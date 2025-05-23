namespace Catalog.Wishlists.Features.RemoveItemFromWishlist;

public record RemoveItemFromWishlistResponse(Guid Id);

public class RemoveItemFromWishlistEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapDelete("/wishlist/{userName}/items/{productId}",
            async ([FromRoute] string userName,
                   [FromRoute] Guid productId,
                   ISender sender) =>
            {
                var command = new RemoveItemFromWishlistCommand(userName, productId);

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


