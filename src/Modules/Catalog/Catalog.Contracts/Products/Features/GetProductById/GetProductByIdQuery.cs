using Shared.Contracts.CQRS;
namespace Catalog.Contracts.Products.Features.GetProductById;

public record GetProductByIdQuery(Guid Id)
    : IQuery<GetProductByIdResult>;

public record GetProductByIdResult
{
    public ProductDTO Product { get; init; }

    public GetProductByIdResult(ProductDTO product)
    {
        Product = product;
    }
}
