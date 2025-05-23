using Catalog.Wishlists.DTOs;

namespace Catalog.Wishlists.Features.AddItemIntoWishlist;

public record AddItemIntoWishlistRequest(string UserName, WishlistItemDTO WishlistItem);
public record AddItemIntoWishlistResponse(Guid Id);

public class AddItemIntoWishlistEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapPost("/wishlist/{userName}/items",
            async ([FromRoute] string userName,
                   [FromBody] AddItemIntoWishlistRequest request,
                   ISender sender) =>
            {
                var command = new AddItemIntoWishlistCommand(userName, request.WishlistItem);

                var result = await sender.Send(command);

                var response = result.Adapt<AddItemIntoWishlistResponse>();

                return Results.Created($"/wishlist/{response.Id}", response);
            })
        .Produces<AddItemIntoWishlistResponse>(StatusCodes.Status201Created)
        .ProducesProblem(StatusCodes.Status400BadRequest)
        .WithSummary("Add Item Into Wishlist")
        .WithDescription("Add Item Into Wishlist")
        .RequireAuthorization();
    }
}
