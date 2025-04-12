using MediatR;

namespace Shared.Contracts.CQRS;

//this interface handles our query request and ensures that each query is matched with coressponding response type
public interface IQueryHandler<in TQuery, TResponse>
    : IRequestHandler<TQuery, TResponse>
    where TQuery : IQuery<TResponse>
    where TResponse : notnull
{
}