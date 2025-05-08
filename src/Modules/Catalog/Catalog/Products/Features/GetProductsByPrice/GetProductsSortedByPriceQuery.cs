using Catalog.Contracts.Products.DTOs;
using MediatR;

namespace Catalog.Products.Features.GetProductsByPrice;

public sealed record GetProductsSortedByPriceQuery : IRequest<List<ProductDTO>>;


