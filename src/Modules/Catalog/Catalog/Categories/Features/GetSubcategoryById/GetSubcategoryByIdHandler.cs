namespace Catalog.Categories.Features.GetSubcategoryById;
using Mapster;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Catalog.Categories.DTOs;

public record GetSubcategoryByIdQuery(Guid Id)
    : IRequest<GetSubcategoryByIdResult?>;

public record GetSubcategoryByIdResult(SubcategoryDto Subcategory);

internal class GetSubcategoryByIdHandler
    : IRequestHandler<GetSubcategoryByIdQuery, GetSubcategoryByIdResult?>
{
    private readonly CatalogDbContext _db;

    public GetSubcategoryByIdHandler(CatalogDbContext db) => _db = db;

    public async Task<GetSubcategoryByIdResult?> Handle(
        GetSubcategoryByIdQuery request,
        CancellationToken cancellationToken)
    {
        var entity = await _db.Subcategories
                              .AsNoTracking()
                              .FirstOrDefaultAsync(s => s.Id == request.Id, cancellationToken);

        if (entity is null)
            return null;

        var dto = entity.Adapt<SubcategoryDto>();
        return new GetSubcategoryByIdResult(dto);
    }
}
