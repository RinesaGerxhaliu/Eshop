namespace Catalog.Data.Seed
{
    public class CatalogDataSeeder(CatalogDbContext dbContext) : IDataSeeder
    {
        public async  Task SeedAllAsync()
        {

            if (!await dbContext.Brands.AnyAsync())
            {
                await dbContext.Brands.AddRangeAsync(InitialData.Brands);
                await dbContext.SaveChangesAsync();
            }

            if (!await dbContext.Categories.AnyAsync())
            {
                await dbContext.Categories.AddRangeAsync(InitialData.Categories);
                await dbContext.SaveChangesAsync();
            }
        }
    }
}
