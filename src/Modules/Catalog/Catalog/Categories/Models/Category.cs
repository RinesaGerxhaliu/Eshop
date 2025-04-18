namespace Catalog.Categories.Models
{
    public class Category : Entity<Guid>
    {
        public string Name { get; private set; } = default!;

        public Category(Guid id, string name)
        {
            Id = id;
            Name = name ?? throw new ArgumentNullException(nameof(name));
        }
    }

}
