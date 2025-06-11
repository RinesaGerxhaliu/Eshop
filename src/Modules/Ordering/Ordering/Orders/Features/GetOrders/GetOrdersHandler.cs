﻿using Ordering.Orders.Dtos;

namespace Ordering.Orders.Features.GetOrders;

public record GetOrdersQuery(PaginationRequest PaginationRequest)
    : IQuery<GetOrdersResult>;

public record GetOrdersResult(PaginatedResult<OrderDto> Orders);

internal class GetOrdersHandler(OrderingDbContext dbContext)
    : IQueryHandler<GetOrdersQuery, GetOrdersResult>
{
    public async Task<GetOrdersResult> Handle(GetOrdersQuery query, CancellationToken cancellationToken)
    {
        var pageIndex = query.PaginationRequest.PageIndex;
        var pageSize = query.PaginationRequest.PageSize;

        var totalCount = await dbContext.Orders
            .LongCountAsync(cancellationToken);

        var orders = await dbContext.Orders
            .AsNoTracking()
            .Include(x => x.Items)
            .OrderByDescending(o => o.CreatedAt) // Optional: Order by creation date
            .Skip(pageSize * pageIndex)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        var orderDtos = orders.Adapt<List<OrderDto>>();

        return new GetOrdersResult(
            new PaginatedResult<OrderDto>(pageIndex, pageSize, totalCount, orderDtos));
    }
}

