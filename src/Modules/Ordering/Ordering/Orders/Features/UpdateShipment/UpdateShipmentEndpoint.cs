using Carter;
using Mapster;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;

namespace Ordering.Orders.Features.UpdateShipment;

using System.Text.Json.Serialization;

public record UpdateShipmentStatusRequest(
    [property: JsonPropertyName("newStatus")] ShipmentStatus NewStatus,
    [property: JsonPropertyName("statusDate")] DateTime? StatusDate);


public record UpdateShipmentStatusResponse(Guid ShipmentId);

public class UpdateShipmentStatusEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapPut("/shipments/{shipmentId:guid}/status", async (
            Guid shipmentId,
            [FromBody] UpdateShipmentStatusRequest request,
            ISender sender) =>
        {
            var command = new UpdateShipmentStatusCommand(
                ShipmentId: shipmentId,
                NewStatus: request.NewStatus,
                StatusDate: request.StatusDate);

            var result = await sender.Send(command);
            var response = result.Adapt<UpdateShipmentStatusResponse>();

            return Results.Ok(response);
        })
        .WithName("UpdateShipmentStatus")
        .Produces<UpdateShipmentStatusResponse>(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status400BadRequest)
        .WithSummary("Update shipment status")
        .WithDescription("Allows admin to update the status of a shipment.");
    }
}
