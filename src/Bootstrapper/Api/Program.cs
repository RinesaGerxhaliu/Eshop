using Api;
using Api.Identity;
using Catalog.Data.Repositories;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

MapsterConfig.RegisterMappings();

builder.Host.UseSerilog((context, config) =>
    config.ReadFrom.Configuration(context.Configuration));

var catalogAssembly = typeof(CatalogModule).Assembly;
var basketAssembly = typeof(BasketModule).Assembly;
var orderingAssembly = typeof(OrderingModule).Assembly;
var authAssembly = typeof(AuthModule).Assembly;

builder.Services.AddCarterWithAssemblies(catalogAssembly, basketAssembly, orderingAssembly, authAssembly);
builder.Services.AddMediatRWithAssemblies(catalogAssembly, basketAssembly, orderingAssembly);
builder.Services.AddScoped<IClaimsTransformation, KeycloakRolesClaimsTransformation>();


builder.Services.AddHttpContextAccessor();
builder.Services.AddTransient<IProductReviewRepository, ProductReviewRepository>();

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
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services
    .AddCatalogModule(builder.Configuration)
    .AddBasketModule(builder.Configuration)
    .AddOrderingModule(builder.Configuration);

builder.Services.AddExceptionHandler<CustomExceptionHandler>();

var app = builder.Build();

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

app.Run();
