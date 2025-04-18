namespace Catalog.Brands.Models
{
    public class Brand : Entity<Guid>
    {
        public string Name { get; private set; } = default!;

        public Brand(Guid id, string name)
        {
            Id = id;
            Name = name ?? throw new ArgumentNullException(nameof(name));
        }
    }

}
