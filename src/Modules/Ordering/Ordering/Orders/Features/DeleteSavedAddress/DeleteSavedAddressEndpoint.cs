namespace Ordering.Orders.Features.DeleteSavedAddress
{
    public class DeleteSavedAddressEndpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapDelete("/saved-addresses/{id:guid}", async (Guid id, ISender sender) =>
            {
                var command = new DeleteSavedAddressCommand(id);
                var result = await sender.Send(command);

                return result.IsDeleted
                    ? Results.NoContent()
                    : Results.NotFound(new { Message = "Saved address not found." });
            })
            .RequireAuthorization() 
            .WithName("DeleteSavedAddress")
            .Produces(StatusCodes.Status204NoContent)
            .ProducesProblem(StatusCodes.Status404NotFound)
            .WithSummary("Delete Saved Address")
            .WithDescription("Deletes a saved address by Id.");
        }
    }
}
