using System;
using System.Security.Claims;
using Carter;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Shared.Pagination;

namespace Catalog.Products.Features.GetAllReviews
{
    public class GetAllReviewsForAdminEndpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapGet("/admin/reviews", async (
                    [AsParameters] PaginationRequest pagination,
                    Guid? productId,
                    ISender sender,
                    ClaimsPrincipal user
                ) =>
            {
                if (!user.IsInRole("admin"))
                    return Results.Forbid();

                var result = await sender.Send(
                    new GetAllReviewsQuery(pagination, productId)
                );

                return Results.Ok(result);
            })
            .WithName("Get All Reviews")
            .Produces<GetAllReviewsResult>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status403Forbidden)
            .WithSummary("Get All Reviews (admin only)")
            .WithDescription("Fetches paginated reviews; accessible only by users in the 'admin' role.");
        }
    }
}
