public record GetSavedAddressByIdQuery(Guid Id)
    : IQuery<GetSavedAddressByIdResult?>;

public record GetSavedAddressByIdResult(SavedAddressDto Address);

internal class GetSavedAddressByIdHandler(OrderingDbContext dbContext)
    : IQueryHandler<GetSavedAddressByIdQuery, GetSavedAddressByIdResult?>
{
    public async Task<GetSavedAddressByIdResult?> Handle(GetSavedAddressByIdQuery query, CancellationToken cancellationToken)
    {
        var address = await dbContext.SavedAddresses.FindAsync(new object[] { query.Id }, cancellationToken);

        if (address is null)
            return null;

        var dto = new SavedAddressDto(
            Id: address.Id,
            CustomerId: address.CustomerId,
            Address: new ShippingAddressDto(
                Street: address.Address.Street,
                City: address.Address.City,
                State: address.Address.State,
                PostalCode: address.Address.PostalCode,
                Country: address.Address.Country,
                PhoneNumber: address.Address.PhoneNumber
            ),
            IsDefault: address.IsDefault
        );

        return new GetSavedAddressByIdResult(dto);
    }
}
