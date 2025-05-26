using Ordering.Orders.Models;
using Ordering.Shippings.Models;
using System.Threading;
using System.Threading.Tasks;


public record CreateSavedAddressCommand(SavedAddressDto SavedAddress) : ICommand<CreateSavedAddressResult>;

public record CreateSavedAddressResult(Guid Id);

internal class CreateSavedAddressHandler(OrderingDbContext dbContext)
    : ICommandHandler<CreateSavedAddressCommand, CreateSavedAddressResult>
{
    public async Task<CreateSavedAddressResult> Handle(CreateSavedAddressCommand command, CancellationToken cancellationToken)
    {
        var dto = command.SavedAddress;

        var address = new ShippingAddress
        {
            Street = dto.Address.Street,
            City = dto.Address.City,
            State = dto.Address.State,
            PostalCode = dto.Address.PostalCode,
            Country = dto.Address.Country,
            PhoneNumber = dto.Address.PhoneNumber
        };

        var savedAddress = SavedAddress.Create(
            id: Guid.NewGuid(),
            customerId: dto.CustomerId,
            address: address,
            isDefault: dto.IsDefault
        );

        dbContext.SavedAddresses.Add(savedAddress);
        await dbContext.SaveChangesAsync(cancellationToken);

        return new CreateSavedAddressResult(savedAddress.Id);
    }
}
