var builder = WebApplication.CreateBuilder(args);

// Adding services to the built-in dependency injection container
// Each module handles its own dependencies, making the codebase more modular

/*builder.Services.AddCarter(configurator: config =>
{
    var catalogModules = typeof(CatalogModule).Assembly.GetTypes()
        .Where(t => t.IsAssignableTo(typeof(ICarterModule))).ToArray();

    config.WithModules(catalogModules);
});*/

builder.Services
    .AddCarterWithAssemblies(typeof(CatalogModule).Assembly);

builder.Services
    .AddCatalogModule(builder.Configuration)
    .AddBasketModule(builder.Configuration)
    .AddOrderingModule(builder.Configuration);

builder.Services
    .AddExceptionHandler<CustomExceptionHandler>();

var app = builder.Build();

// Using these use extension methods, we are configuring the HTTP Request Pipeline
//"app" is a type of web application that implements several interfaces

app.MapCarter();

app
   .UseCatalogModule()
   .UseBasketModule()
   .UseOrderingModule();

app.UseExceptionHandler(options => { });

app.Run();