using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Catalog.Products.Features.CreateProduct
{

    public record CreateProductCommand(string name, string description, decimal price) : IRequest<CreateProductResult>;
    public record CreateProductResult(Guid Id);
    internal class CreateProductHandler : IRequestHandler<CreateProductCommand, CreateProductResult>
    {

        public async Task<CreateProductResult> Handle(CreateProductCommand command,
        CancellationToken cancellationToken)
        {
            //business logic to create a product
            throw new NotImplementedException();
       
        }

    }
}
