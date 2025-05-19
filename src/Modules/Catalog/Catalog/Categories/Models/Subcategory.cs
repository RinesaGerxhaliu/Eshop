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

        internal void Update(
        string newName,
        Guid newCategoryId)
        {
            if (string.IsNullOrWhiteSpace(newName))
                throw new ArgumentNullException(nameof(newName));
            if (newCategoryId == Guid.Empty)
                throw new ArgumentException("CategoryId must be a valid GUID", nameof(newCategoryId));

            Name = newName;
            CategoryId = newCategoryId;
        }

    }

}
