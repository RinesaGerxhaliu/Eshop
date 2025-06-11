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
        app.MapPost("/wishlist", async (
            CreateWishlistRequest request,
            ISender sender,
            ClaimsPrincipal user,
            CatalogDbContext context) => // Inject context here
        {
            var userName = user.Identity?.Name;
            if (string.IsNullOrEmpty(userName))
                return Results.BadRequest("UserName is null or empty.");

            // Check if wishlist exists
            var existing = await context.Wishlists
                .Include(w => w.Items) // optional: include items
                .FirstOrDefaultAsync(x => x.UserName == userName);

            if (existing != null)
            {
                // Return the existing wishlist (or just its ID)
                var existingResponse = new CreateWishlistResponse(existing.Id);
                return Results.Ok(existingResponse); // or Results.Conflict(existingResponse)
            }

            // Only now: create the wishlist for this user
            var updatedWishlist = request.Wishlist with { UserName = userName };
            var command = new CreateWishlistCommand(updatedWishlist);
            var result = await sender.Send(command);
            var response = result.Adapt<CreateWishlistResponse>();

            return Results.Created($"/wishlist/{response.Id}", response);
        })
        .Produces<CreateWishlistResponse>(StatusCodes.Status201Created)
        .Produces<CreateWishlistResponse>(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status400BadRequest)
        .WithSummary("Create Wishlist")
        .WithDescription("Creates a wishlist if one doesn't exist for the authenticated user. Returns the existing one if it does.")
        .RequireAuthorization();
    }

}
