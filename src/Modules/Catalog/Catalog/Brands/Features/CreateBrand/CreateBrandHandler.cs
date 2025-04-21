namespace Catalog.Brands.Features.CreateBrand;

public record CreateBrandCommand(string Name) : IRequest<CreateBrandResult>;

public record CreateBrandResult(Guid Id);

internal class CreateBrandHandler(CatalogDbContext dbContext)
    : IRequestHandler<CreateBrandCommand, CreateBrandResult>
{
    public async Task<CreateBrandResult> Handle(CreateBrandCommand command, CancellationToken cancellationToken)
    {
        var brand = new Brand(Guid.NewGuid(), command.Name);

        dbContext.Brands.Add(brand);
        await dbContext.SaveChangesAsync(cancellationToken);

        return new CreateBrandResult(brand.Id);
    }
}
