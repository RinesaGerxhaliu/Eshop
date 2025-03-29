using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace Shared.Data
{
    public static class Extensions
    {
        //we use this to run and update database and reflect all changes and migration folder to the real
        //PostgreSQL database when the app starts up
        public static IApplicationBuilder UseMigration<TContext>(this IApplicationBuilder app)
            where TContext : DbContext
        { 
            MigrationDatabaseAsync<TContext>(app.ApplicationServices).GetAwaiter().GetResult();

            return app;
        }

        private static async Task MigrationDatabaseAsync<TContext>(IServiceProvider serviceProvider) 
            where TContext : DbContext
        {
            using var scope = serviceProvider.CreateScope();

            var context = scope.ServiceProvider.GetRequiredService<TContext>();

            await context.Database.MigrateAsync();
        }
    }
}
