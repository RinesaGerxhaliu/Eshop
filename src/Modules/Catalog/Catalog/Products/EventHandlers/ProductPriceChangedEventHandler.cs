namespace Catalog.Products.EventHandlers
{
    public class ProductPriceChangedEventHandler(ILogger<ProductPriceChangedEventHandler> logger)
        : INotificationHandler<ProductPriceChangedEvent>
    {
        public Task Handle(ProductPriceChangedEvent notification, CancellationToken cancellationToken)
        {
            //We're gonna publish ProductPriceChangedIntegrationEvent to update the basket price
            logger.LogInformation("Domain Event handled: {Domain Event}", notification.GetType().Name);
            return Task.CompletedTask;
        }
    }
}
