using Ordering.Orders.Dtos;

namespace Ordering.Orders.Features.GetOrders;

public record GetOrdersQuery(PaginationRequest PaginationRequest, Guid CustomerId)
    : IQuery<GetOrdersResult>;

public record GetOrdersResult(PaginatedResult<OrderDto> Orders);

internal class GetOrdersHandler(OrderingDbContext dbContext)
    : IQueryHandler<GetOrdersQuery, GetOrdersResult>
{
    public async Task<GetOrdersResult> Handle(GetOrdersQuery query, CancellationToken cancellationToken)
    {
        var pageIndex = query.PaginationRequest.PageIndex;
        var pageSize = query.PaginationRequest.PageSize;
        var customerId = query.CustomerId; 

        var totalCount = await dbContext.Orders
            .Where(o => o.CustomerId == customerId) 
            .LongCountAsync(cancellationToken);

        var orders = await dbContext.Orders
            .AsNoTracking()
            .Include(x => x.Items)
            .Where(o => o.CustomerId == customerId) 
            .Skip(pageSize * pageIndex)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        var orderDtos = orders.Adapt<List<OrderDto>>();

        return new GetOrdersResult(
            new PaginatedResult<OrderDto>(pageIndex, pageSize, totalCount, orderDtos));
    }
}
