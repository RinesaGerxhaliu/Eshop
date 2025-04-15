using MassTransit;
using Shared.Messaging.Events;

namespace Catalog.Products.EventHandlers
{
    public class ProductPriceChangedEventHandler(IBus bus, ILogger<ProductPriceChangedEventHandler> logger)
        : INotificationHandler<ProductPriceChangedEvent>
    {
        public async Task Handle(ProductPriceChangedEvent notification, CancellationToken cancellationToken)
        {
            //We're gonna publish ProductPriceChangedIntegrationEvent to update the basket price
            logger.LogInformation("Domain Event handled: {Domain Event}", notification.GetType().Name);

            var integrationEvent = new ProductPriceChangedIntegrationEvent
            {
                ProductId = notification.Product.Id,
                Name = notification.Product.Name,
                Description = notification.Product.Description,
                Price = notification.Product.Price //set updated product price
            };

            await bus.Publish(integrationEvent, cancellationToken);
        }
    }
}
