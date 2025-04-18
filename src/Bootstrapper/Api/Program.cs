using Api.Register;
using Catalog.Auth.Modules;

var builder = WebApplication.CreateBuilder(args);

builder.Host.UseSerilog((context, config) =>
    config.ReadFrom.Configuration(context.Configuration));

// Adding services to the built-in dependency injection container
// Each module handles its own dependencies, making the codebase more modular

// Common services such as Carter, MediatR, FluentValidation
var catalogAssembly = typeof(CatalogModule).Assembly;
var basketAssembly = typeof(BasketModule).Assembly;
var orderingAssembly = typeof(OrderingModule).Assembly;
var authAssembly = typeof(AuthModule).Assembly;

builder.Services
    .AddCarterWithAssemblies(catalogAssembly, basketAssembly, orderingAssembly,authAssembly); 

builder.Services
    .AddMediatRWithAssemblies(catalogAssembly, basketAssembly, orderingAssembly); 

builder.Services.AddHttpContextAccessor();

// Bind settings from appsettings.json -> Keycloak section
builder.Services.Configure<KeycloakSettings>(
    builder.Configuration.GetSection("Keycloak"));

// Register the HTTP client + service for user creation
builder.Services.AddHttpClient<IIdentityService, KeycloakIdentityService>();

// —————————————————————————————————————————————————————————
// 3) Other shared services
// —————————————————————————————————————————————————————————

//builder.Services
//.AddCarterWithAssemblies(catalogAssembly, basketAssembly, orderingAssembly);

//builder.Services
//.AddMediatRWithAssemblies(catalogAssembly, basketAssembly, orderingAssembly); 

builder.Services.AddStackExchangeRedisCache(options =>
{
    options.Configuration = builder.Configuration.GetConnectionString("Redis");
});

builder.Services
     .AddMassTransitWithAssemblies(builder.Configuration, catalogAssembly, basketAssembly);

builder.Services.AddKeycloakWebApiAuthentication(builder.Configuration);
builder.Services.AddAuthorization();

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

app.UseStaticFiles();
app.MapCarter();
app.UseSerilogRequestLogging();
app.UseExceptionHandler(options => { });
app.UseAuthentication();
app.UseAuthorization();

app.UseStaticFiles();

app
   .UseCatalogModule()
   .UseBasketModule()
   .UseOrderingModule();

app.Run();