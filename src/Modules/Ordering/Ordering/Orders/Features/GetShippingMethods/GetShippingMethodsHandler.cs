using Ordering.Orders.Dtos;
using Ordering.Orders.Models;

namespace Ordering.Orders.Features.GetShippingMethods;

public record GetShippingMethodsQuery() : IQuery<List<ShippingMethodDto>>;

internal class GetShippingMethodsHandler(OrderingDbContext dbContext)
    : IQueryHandler<GetShippingMethodsQuery, List<ShippingMethodDto>>
{
    public async Task<List<ShippingMethodDto>> Handle(GetShippingMethodsQuery query, CancellationToken cancellationToken)
    {
        return await dbContext.ShippingMethods
        .Select(m => new ShippingMethodDto(m.Id, m.Name, m.Cost))
        .ToListAsync(cancellationToken);

    }
}
