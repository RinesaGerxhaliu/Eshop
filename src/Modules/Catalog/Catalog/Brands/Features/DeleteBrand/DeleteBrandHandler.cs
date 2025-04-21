namespace Catalog.Brands.Features.DeleteBrand
{
    public record DeleteBrandCommand(Guid BrandId) : ICommand<DeleteBrandResult>;
    public record DeleteBrandResult(bool IsSuccessful);
    internal class DeleteBrandHandler(CatalogDbContext dbContext)
        : ICommandHandler<DeleteBrandCommand, DeleteBrandResult>
    {
        public async Task<DeleteBrandResult> Handle(DeleteBrandCommand command, CancellationToken cancellationToken)
        {
            var brand = await dbContext.Brands
                .FindAsync(command.BrandId, cancellationToken);

            if (brand is null)
            {
                throw new KeyNotFoundException($"Brand with ID {command.BrandId} not found.");
            }

            dbContext.Brands.Remove(brand);
            await dbContext.SaveChangesAsync(cancellationToken);

            return new DeleteBrandResult(true);
        }
    }
}
