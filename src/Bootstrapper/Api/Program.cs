var builder = WebApplication.CreateBuilder(args);

builder.Host.UseSerilog((context, config) =>
    config.ReadFrom.Configuration(context.Configuration));

// Adding services to the built-in dependency injection container
// Each module handles its own dependencies, making the codebase more modular

// Common services such as Carter, MediatR, FluentValidation
var catalogAssembly = typeof(CatalogModule).Assembly;
var basketAssembly = typeof(BasketModule).Assembly;

builder.Services
    .AddCarterWithAssemblies(
        catalogAssembly,
        basketAssembly);

builder.Services
    .AddMediatRWithAssemblies(
        catalogAssembly,
        basketAssembly);

// Adding CORS policy
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        policy =>
        {
            policy.WithOrigins("http://localhost:3000") // frontend URL
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});

// Module services: Catalog, Basket, Ordering 

builder.Services
    .AddCatalogModule(builder.Configuration)
    .AddBasketModule(builder.Configuration)
    .AddOrderingModule(builder.Configuration);

builder.Services
    .AddExceptionHandler<CustomExceptionHandler>();

var app = builder.Build();

// Using these use extension methods, we are configuring the HTTP Request Pipeline
//"app" is a type of web application that implements several interfaces

app.UseCors("AllowReactApp");

app.MapCarter();
app.UseSerilogRequestLogging();
app.UseExceptionHandler(options => { });

app
   .UseCatalogModule()
   .UseBasketModule()
   .UseOrderingModule();

app.Run();