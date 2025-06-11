using Catalog.Wishlists.DTOs;
using Microsoft.Extensions.Logging;
using System.Security.Claims;

namespace Catalog.Wishlists.Features.CreateWishlist;

public record CreateWishlistRequest
{
    public WishlistDTO Wishlist { get; init; } = default!;
}

public record CreateWishlistResponse(Guid Id);

public class CreateWishlistEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapPost("/wishlist", async (CreateWishlistRequest request, ISender sender, ClaimsPrincipal user) =>
        {
            var userName = user.Identity?.Name;
            if (string.IsNullOrEmpty(userName))
            {
                return Results.BadRequest("UserName is null or empty.");
            }

            // Force the wishlist to use the authenticated user's username
            var updatedWishlist = request.Wishlist with { UserName = userName };

            var command = new CreateWishlistCommand(updatedWishlist);

            var result = await sender.Send(command);

            var response = result.Adapt<CreateWishlistResponse>();

            return Results.Created($"/wishlist/{response.Id}", response);
        })
        .Produces<CreateWishlistResponse>(StatusCodes.Status201Created)
        .ProducesProblem(StatusCodes.Status400BadRequest)
        .WithSummary("Create Wishlist")
        .WithDescription("Creates a wishlist if one doesn't exist for the authenticated user. Returns the existing one if it does.")
        .RequireAuthorization();
    }
}
