namespace Catalog.Categories.Models
{
    public class Subcategory : Entity<Guid>
    {
        public string Name { get; private set; } = default!;
        public Guid CategoryId { get; private set; }

        internal Subcategory(Guid id, string name, Guid categoryId)
        {
            Id = id;
            Name = name ?? throw new ArgumentNullException(nameof(name));
            CategoryId = categoryId;
        }

        internal void Update(string newName)
        {
            Name = newName ?? throw new ArgumentNullException(nameof(newName));
        }
    }

}
