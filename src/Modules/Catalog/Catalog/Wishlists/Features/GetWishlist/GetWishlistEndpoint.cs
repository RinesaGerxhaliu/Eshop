using Catalog.Wishlists.DTOs;

namespace Catalog.Wishlists.Features.GetWishlist;
public record GetWishlistResponse(WishlistDTO Wishlist);

public class GetWishlistEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGet("/wishlist/{userName}", async (string userName, ISender sender) =>
        {
            var result = await sender.Send(new GetWishlistQuery(userName));

            var response = result.Adapt<GetWishlistResponse>();

            return Results.Ok(response);
        })
        .Produces<GetWishlistResponse>(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status400BadRequest)
        .WithSummary("Get Wishlist")
        .WithDescription("Get Wishlist")
        .RequireAuthorization();
    }
}

