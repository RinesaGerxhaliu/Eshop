namespace Ordering.Orders.Features.DeleteShippingMethod;

public class DeleteShippingMethodEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapDelete("/shipping-methods/{id:guid}", async (Guid id, ISender sender) =>
        {
            var result = await sender.Send(new DeleteShippingMethodCommand(id));
            return result ? Results.NoContent() : Results.NotFound();
        })
        .WithName("DeleteShippingMethod")
        .Produces(StatusCodes.Status204NoContent)
        .ProducesProblem(StatusCodes.Status404NotFound)
        .WithSummary("Delete a shipping method")
        .WithDescription("Deletes a shipping method by its ID.");
    }
}
