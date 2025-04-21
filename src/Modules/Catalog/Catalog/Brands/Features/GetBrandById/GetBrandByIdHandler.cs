using Microsoft.EntityFrameworkCore;
using Catalog.Brands.DTOs;
using Catalog.Brands.Exception;


public record GetBrandByIdQuery(Guid Id) : IQuery<GetBrandByIdResult>;
public record GetBrandByIdResult(BrandDTO Brand);

namespace Catalog.Brands.Features.GetBrandById
{
    internal class GetBrandByIdHandler(CatalogDbContext dbContext)
       : IQueryHandler<GetBrandByIdQuery, GetBrandByIdResult>
    {
        public async Task<GetBrandByIdResult> Handle(GetBrandByIdQuery query, CancellationToken cancellationToken)
        {
            var brand = await dbContext.Brands
                                          .AsNoTracking()
                                          .FirstOrDefaultAsync(c => c.Id == query.Id, cancellationToken);

            if (brand == null)
                throw new BrandNotFoundException(query.Id);

            var brandDto = brand.Adapt<BrandDTO>();
            return new GetBrandByIdResult(brandDto);
        }
    }
}
