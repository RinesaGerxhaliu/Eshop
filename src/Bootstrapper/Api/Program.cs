var builder = WebApplication.CreateBuilder(args);

// Adding services to the built-in dependency injection container
// Each module handles its own dependencies, making the codebase more modular
builder.Services
    .AddCatalogModule(builder.Configuration)
    .AddBasketModule(builder.Configuration)
    .AddOrderingModule(builder.Configuration);

var app = builder.Build();

// Using these use extension methods, we are configuring the HTTP Request Pipeline
//"app" is a type of web application that implements several interfaces
app.
    UseCatalogModule()
   .UseBasketModule()
   .UseOrderingModule();

app.Run();