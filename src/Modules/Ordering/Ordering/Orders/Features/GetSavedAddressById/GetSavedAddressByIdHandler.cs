public record GetSavedAddressByIdQuery(Guid Id)
    : IQuery<GetSavedAddressByIdResult?>;

public record GetSavedAddressByIdResult(SavedAddressDto Address);
public record GetSavedAddressByCustomerIdQuery(string CustomerId) : IQuery<GetSavedAddressByIdResult?>;

internal class GetSavedAddressByCustomerIdHandler : IQueryHandler<GetSavedAddressByCustomerIdQuery, GetSavedAddressByIdResult?>
{
    private readonly OrderingDbContext dbContext;

    public GetSavedAddressByCustomerIdHandler(OrderingDbContext dbContext)
    {
        this.dbContext = dbContext;
    }

    public async Task<GetSavedAddressByIdResult?> Handle(GetSavedAddressByCustomerIdQuery query, CancellationToken cancellationToken)
    {
        var address = await dbContext.SavedAddresses
            .Where(a => a.CustomerId == query.CustomerId && a.IsDefault)
            .FirstOrDefaultAsync(cancellationToken);

        if (address == null)
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

