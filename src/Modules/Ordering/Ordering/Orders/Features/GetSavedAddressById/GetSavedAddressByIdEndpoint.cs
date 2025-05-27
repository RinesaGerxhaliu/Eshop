using System.Security.Claims;

namespace Ordering.Orders.Features.GetSavedAddressById
{
    namespace Ordering.Orders.Features.GetSavedAddressByCustomerId
    {
       public class GetSavedAddressByCustomerIdEndpoint : ICarterModule
        {
            public void AddRoutes(IEndpointRouteBuilder app)
            {
                app.MapGet("/saved-addresses/me", async (ClaimsPrincipal user, ISender sender) =>
                {
                    var customerId = user.FindFirstValue(ClaimTypes.NameIdentifier);

                    if (string.IsNullOrEmpty(customerId))
                        return Results.Unauthorized();

                    var result = await sender.Send(new GetSavedAddressByCustomerIdQuery(customerId));

                    return result is not null
                        ? Results.Ok(result)
                        : Results.NotFound();
                })
                .WithName("GetSavedAddressByCustomerId")
                .Produces<GetSavedAddressByIdResult>(StatusCodes.Status200OK)
                .Produces(StatusCodes.Status401Unauthorized)
                .Produces(StatusCodes.Status404NotFound)
                .WithSummary("Get My Saved Address")
                .WithDescription("Returns the saved address for the currently authenticated user.")
                .RequireAuthorization();
            }
        }


    }

}
