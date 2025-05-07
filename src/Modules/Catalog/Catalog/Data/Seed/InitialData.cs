namespace Catalog.Data.Seed;
public static class InitialData
{
    public static IEnumerable<Brand> Brands => new List<Brand>()
    {
        new Brand(new Guid("76c5f18a-c125-4f43-9ef2-b90ff9f70768"), "Innisfree"),
        new Brand(new Guid("7b5875f1-6e6a-44a0-bf39-c7b597742ca5"), "Etude House"),
        new Brand(new Guid("2d4583e3-2992-4719-8c82-23593fc4fe92"), "COSRX"),
        new Brand(new Guid("ea4b1e83-156a-4681-bab5-8d5eae01722b"), "Missha"),
        new Brand(new Guid("a9f44cb5-cf25-413b-b86a-6f5a6cfc8181"), "Laneige"),
        new Brand(new Guid("2345f9f8-6b9e-4137-910f-d68c961a7d61"), "Dr. Jart+"),
        new Brand(new Guid("ebd350ad-8d5f-4641-8613-9c8e2146de74"), "Some By Mi")
    };

    public static IEnumerable<Category> Categories => new List<Category>()
{
    new Category(Guid.Parse("4f3e77a1-1c71-4b91-9ef4-37bdc409d251"), "Cleansing Balms"),
    new Category(Guid.Parse("6c49d44e-4b7e-4f9e-99e5-570d646ed8a1"), "Cleansing Oils"),
    new Category(Guid.Parse("5b431395-9d43-4d64-a2b1-601a05a9d187"), "Water Based Cleansers"),
    new Category(Guid.Parse("b3fbd679-727d-4297-bbc0-e06eaec7e40b"), "Physical Exfoliants"),
    new Category(Guid.Parse("d94d1625-d23f-4e60-a4f3-1393509ad0fd"), "Chemical Exfoliants"),
    new Category(Guid.Parse("a08b9f68-099d-40fa-80d1-c2d03e0ac4ee"), "Hydrating Toners"),
    new Category(Guid.Parse("e42602d2-738f-4dff-b112-6b702fc5bead"), "Exfoliating Toners"),
    new Category(Guid.Parse("24c18eb0-05c5-46e0-975e-9c7f97e2c226"), "Hydrating Serums"),
    new Category(Guid.Parse("0a7f5a7a-0dcf-4c18-9c8b-2d383478e3f7"), "Acne Serums"),
    new Category(Guid.Parse("c79f3a13-5e8c-4497-bb99-f8ff5392787e"), "Oil Control Serums"),
    new Category(Guid.Parse("36e19576-20cf-4fc1-8ed0-60c5d2a7a7e6"), "Sheet Masks"),
    new Category(Guid.Parse("9a8d19d5-43a3-4d48-b8b4-54c6c70c46d0"), "Sleeping Masks"),
    new Category(Guid.Parse("e32e4ecf-9e33-45db-970e-3f3cb2975e27"), "Wash Off Masks"),
    new Category(Guid.Parse("5ec5537e-9278-4c4e-8cb3-20522a1e9aa4"), "Moisturizers for Normal Skin"),
    new Category(Guid.Parse("b6b82ee2-48cd-4051-9f1e-7a5c9a4307a5"), "Moisturizers for Oily Skin"),
    new Category(Guid.Parse("3b10a06c-28f6-4457-bf76-c46b1a0e317a"), "Moisturizers for Dry Skin"),
    new Category(Guid.Parse("6e6e3c3e-3d4d-471e-a7e6-f7b3c75ed432"), "Sunscreens")
};
}