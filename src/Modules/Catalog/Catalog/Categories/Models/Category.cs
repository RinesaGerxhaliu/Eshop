namespace Catalog.Categories.Models
{
    public class Category : Entity<Guid>
    {
        public string Name { get; private set; } = default!;

        private readonly List<Subcategory> _subcategories = new();
        public IReadOnlyList<Subcategory> Subcategories => _subcategories.AsReadOnly();

        public Category(Guid id, string name)
        {
            Id = id;
            Name = name ?? throw new ArgumentNullException(nameof(name));
        }

        public void Update(string name)
        {
            Name = name ?? throw new ArgumentNullException(nameof(name));
        }

        public void AddSubcategory(Guid id, string name)
        {
            if (string.IsNullOrWhiteSpace(name))
                throw new ArgumentNullException(nameof(name));

            if (_subcategories.Any(s => s.Name.Equals(name, StringComparison.OrdinalIgnoreCase)))
                return;

            var subcategory = new Subcategory(id, name, Id);
            _subcategories.Add(subcategory);
        }

        public void RemoveSubcategory(Guid subcategoryId)
        {
            var sub = _subcategories.FirstOrDefault(s => s.Id == subcategoryId);
            if (sub is not null)
                _subcategories.Remove(sub);
        }

    }

}
