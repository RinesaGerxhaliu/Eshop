using Catalog.Contracts.Products.DTOs;
using MediatR;

namespace Catalog.Products.Features.GetProductsByNameAscending;

public sealed record GetProductsSortedByNameQuery : IRequest<List<ProductDTO>>;
