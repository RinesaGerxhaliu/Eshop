namespace Shared.Data.Seed
{
    public interface IDataSeeder
    {
        //this will be implement by each module
        Task SeedAllAsync();
    }
}
