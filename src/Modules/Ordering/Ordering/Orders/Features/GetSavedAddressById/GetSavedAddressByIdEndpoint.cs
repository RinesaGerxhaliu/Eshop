namespace Ordering.Orders.Features.GetSavedAddressById
{
    public class GetSavedAddressByIdEndpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapGet("/saved-addresses/{id:guid}", async (Guid id, ISender sender) =>
            {
                var result = await sender.Send(new GetSavedAddressByIdQuery(id));

                return result is not null
                    ? Results.Ok(result)
                    : Results.NotFound();
            })
            .WithName("GetSavedAddressById")
            .Produces<GetSavedAddressByIdResult>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status404NotFound)
            .WithSummary("Get Saved Address by Id")
            .WithDescription("Returns a saved address by its Id.");
        }
    }

}
