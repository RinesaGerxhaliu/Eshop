using Ordering.Orders.Dtos;
using Ordering.Orders.Models;
using Ordering.Shippings.Models;
using System;
using System.Threading;
using System.Threading.Tasks;

    public record UpdateSavedAddressCommand(SavedAddressDto SavedAddress) : ICommand;

    internal class UpdateSavedAddressHandler(OrderingDbContext dbContext)
        : ICommandHandler<UpdateSavedAddressCommand>
    {
        public async Task<Unit> Handle(UpdateSavedAddressCommand command, CancellationToken cancellationToken)
        {
            var dto = command.SavedAddress;

            var existing = await dbContext.SavedAddresses.FindAsync(new object[] { dto.Id }, cancellationToken);

            if (existing is null)
                throw new Exception("Saved address not found.");

            var updatedAddress = new ShippingAddress
            {
                Street = dto.Address.Street,
                City = dto.Address.City,
                State = dto.Address.State,
                PostalCode = dto.Address.PostalCode,
                Country = dto.Address.Country,
                PhoneNumber = dto.Address.PhoneNumber
            };

            // Përditëso vlerat
            existing.Update(dto.CustomerId, updatedAddress, dto.IsDefault);

            await dbContext.SaveChangesAsync(cancellationToken);
            return Unit.Value;
        }
    }

