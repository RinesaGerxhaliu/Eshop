namespace Ordering.Orders.Features.GetShipmentByOrderId;

public record GetShipmentByOrderIdRequest(Guid OrderId);

public record GetShipmentByOrderIdResponse(
    Guid Id,
    Guid OrderId,
    string CustomerId,
    ShippingAddressDto Address,
    Guid ShippingMethodId,
    ShipmentStatus Status,
    DateTime? ShippedDate,
    DateTime? DeliveredDate,
    Guid? SavedAddressId
);

public class GetShipmentByOrderIdEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGet("/shipments/order/{orderId}", async (Guid orderId, ISender sender) =>
        {
            var query = new GetShipmentByOrderIdQuery(orderId);
            var result = await sender.Send(query);

            var response = new GetShipmentByOrderIdResponse(
                result.Id,
                result.OrderId,
                result.CustomerId,
                result.Address,
                result.ShippingMethodId,
                result.Status,
                result.ShippedDate,
                result.DeliveredDate,
                result.SavedAddressId);

            return Results.Ok(response);
        })
        .WithName("GetShipmentByOrderId")
        .Produces<GetShipmentByOrderIdResponse>(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status404NotFound)
        .WithSummary("Get shipment details by Order ID")
        .WithDescription("Returns shipment details for the specified order ID.");
    }
}

