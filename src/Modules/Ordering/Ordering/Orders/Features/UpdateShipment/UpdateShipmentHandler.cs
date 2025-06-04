using Ordering.Shippings.Models;
using System;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Ordering.Orders.Features.UpdateShipment;

public record UpdateShipmentStatusCommand(
    Guid ShipmentId,
    ShipmentStatus NewStatus,
    DateTime? StatusDate = null) : ICommand<UpdateShipmentStatusResult>;

public record UpdateShipmentStatusResult(Guid ShipmentId);

internal class UpdateShipmentStatusHandler(OrderingDbContext dbContext)
    : ICommandHandler<UpdateShipmentStatusCommand, UpdateShipmentStatusResult>
{
    public async Task<UpdateShipmentStatusResult> Handle(UpdateShipmentStatusCommand command, CancellationToken cancellationToken)
    {
        var shipment = await dbContext.Shipments
            .FirstOrDefaultAsync(s => s.Id == command.ShipmentId, cancellationToken);

        if (shipment == null)
            throw new Exception("Shipment not found");

        // Business rules: check allowed status transitions
        switch (command.NewStatus)
        {
            case ShipmentStatus.Shipped:
                shipment.MarkShipped(command.StatusDate ?? DateTime.UtcNow);
                break;

            case ShipmentStatus.Delivered:
                shipment.MarkDelivered(command.StatusDate ?? DateTime.UtcNow);
                break;

            case ShipmentStatus.Cancelled:
                // Let's assume you want to allow cancelling anytime before delivered
                if (shipment.Status == ShipmentStatus.Delivered)
                    throw new InvalidOperationException("Cannot cancel delivered shipment.");
                shipment.Cancel();
                break;


            case ShipmentStatus.Pending:
                throw new InvalidOperationException("Cannot revert to Pending status.");

            default:
                throw new InvalidOperationException("Invalid shipment status.");
        }

        await dbContext.SaveChangesAsync(cancellationToken);

        return new UpdateShipmentStatusResult(shipment.Id);
    }
}
