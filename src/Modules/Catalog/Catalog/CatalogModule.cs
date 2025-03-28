using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Catalog
{
    public static class CatalogModule
    {
        public static IServiceCollection AddCatalogModule(this IServiceCollection services,
            IConfiguration configuration)
        {
            //Data Infrastructure Services
            var connectionString = configuration.GetConnectionString("Database");

            services.AddDbContext<CatalogDbContext>(options =>
            options.UseNpgsql(connectionString));

            return services;

        }

        //IApplicationBuilder is one of the interfaces that "app" in Program.cs implements
        public static IApplicationBuilder UseCatalogModule(this IApplicationBuilder app)
        {
            return app;

        }
    }
}
