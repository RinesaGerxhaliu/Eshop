namespace Ordering.Orders.Features.DeleteSavedAddress
{
    public record DeleteSavedAddressCommand(Guid Id) : ICommand<DeleteSavedAddressResult>;

    public record DeleteSavedAddressResult(bool IsDeleted);
    internal class DeleteSavedAddressHandler(OrderingDbContext dbContext)
    : ICommandHandler<DeleteSavedAddressCommand, DeleteSavedAddressResult>
    {
        public async Task<DeleteSavedAddressResult> Handle(DeleteSavedAddressCommand command, CancellationToken cancellationToken)
        {
            var address = await dbContext.SavedAddresses.FindAsync(new object[] { command.Id }, cancellationToken);

            if (address is null)
            {
                return new DeleteSavedAddressResult(false);
            }

            dbContext.SavedAddresses.Remove(address);
            await dbContext.SaveChangesAsync(cancellationToken);

            return new DeleteSavedAddressResult(true);
        }
    }

}
