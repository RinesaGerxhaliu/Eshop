namespace Ordering.Orders.Features.GetOrdersByShipmentStatus;

public record GetOrdersByShipmentStatusRequest(ShipmentStatus Status);

public record GetOrdersByShipmentStatusResponse(List<OrderSummaryDto> Orders);

public class GetOrdersByShipmentStatusEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGet("/orders/by-shipment-status/{status}", async (ShipmentStatus status, ISender sender) =>
        {
            var query = new GetOrdersByShipmentStatusQuery(status);
            var result = await sender.Send(query);

            var response = new GetOrdersByShipmentStatusResponse(result.Orders);

            return Results.Ok(response);
        })
        .WithName("GetOrdersByShipmentStatus")
        .Produces<GetOrdersByShipmentStatusResponse>(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status400BadRequest)
        .WithSummary("Get all orders filtered by shipment status")
        .WithDescription("Returns orders filtered by their shipment status (e.g., Delivered, Pending).");
    }
}

