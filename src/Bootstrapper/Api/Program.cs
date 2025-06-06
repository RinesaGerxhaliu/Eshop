using Catalog.Wishlists.Repositories;
using MediatR;
using Ordering.Data.Configurations;
using Stripe;
using System.Reflection;

var builder = WebApplication.CreateBuilder(args);

// 1. Bind the StripeSettings section into DI
builder.Services.Configure<StripeSettings>(
    builder.Configuration.GetSection("Stripe")
);

MapsterConfig.RegisterMappings();

builder.Host.UseSerilog((context, config) =>
    config.ReadFrom.Configuration(context.Configuration));

var catalogAssembly = typeof(CatalogModule).Assembly;
var basketAssembly = typeof(BasketModule).Assembly;
var orderingAssembly = typeof(OrderingModule).Assembly;
var apiAssembly = typeof(LoginUserHandler).Assembly;
// This always gets the Api project's assembly

builder.Services.AddCarterWithAssemblies(catalogAssembly, basketAssembly, orderingAssembly, apiAssembly);
builder.Services.AddMediatRWithAssemblies(catalogAssembly, basketAssembly, orderingAssembly, apiAssembly);
builder.Services.AddScoped<IClaimsTransformation, KeycloakRolesClaimsTransformation>();


builder.Services.AddHttpContextAccessor();
builder.Services.AddTransient<IProductReviewRepository, ProductReviewRepository>();
builder.Services.AddScoped<IWishlistRepository, WishlistRepository>();
builder.Services.AddScoped<IDataSeeder, CatalogDataSeeder>();
builder.Services.AddScoped<IRequestHandler<LoginUserCommand, LoginResult>, LoginUserHandler>();


builder.Services.Configure<KeycloakSettings>(
    builder.Configuration.GetSection("Keycloak"));

builder.Services.AddHttpClient<IIdentityService, KeycloakIdentityService>();

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority = builder.Configuration["Keycloak:Authority"];
        options.Audience = builder.Configuration["Keycloak:ClientId"];
        options.RequireHttpsMetadata = false; 

        options.TokenValidationParameters = new TokenValidationParameters
        {
            NameClaimType = "preferred_username",
            RoleClaimType = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
        };
    });

builder.Services.AddAuthorization();

builder.Services.AddStackExchangeRedisCache(options =>
{
    options.Configuration = builder.Configuration.GetConnectionString("Redis");
});

builder.Services.AddMassTransitWithAssemblies(builder.Configuration, catalogAssembly, basketAssembly);

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins("https://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

builder.Services
    .AddCatalogModule(builder.Configuration)
    .AddBasketModule(builder.Configuration)
    .AddOrderingModule(builder.Configuration);

builder.Services.AddExceptionHandler<CustomExceptionHandler>();

var app = builder.Build();

var stripeOpts = app.Services.GetRequiredService<IOptions<StripeSettings>>().Value;
StripeConfiguration.ApiKey = stripeOpts.SecretKey;

app.UseSerilogRequestLogging();
app.UseCors("AllowReactApp");

app.UseStaticFiles();

app.UseExceptionHandler(_ => { });
app.UseAuthentication();
app.UseAuthorization();

app.MapCarter(); 

app.UseCatalogModule();
app.UseBasketModule();
app.UseOrderingModule();

app.UseMigration<CatalogDbContext>();

app.Run();
