using Domain.Repositories;
using Domain.Services;
using Infrastructure.Persistence;
using Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Infrastructure
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddDbContext<ApplicationDbContext>(
                    options => options.UseNpgsql(configuration.GetConnectionString("DefaultConnection"))
                );
            services.AddScoped<IClientRepository, ClientRepository>();
            services.AddScoped<IProjectRepository, ProjectRepository>();
            services.AddScoped<IDesignerRepository, DesignerRepository>();
            services.AddScoped<IFileStorageService, AzureBlobStorageService>();
            services.AddScoped<IAdminRepository, AdminRepository>();
            services.AddScoped<IEmailService, EmailService>();
            services.AddScoped<IValidationTokenService, ValidationTokenService>();
            services.AddScoped<IHouseSpecificationsRepository, HouseSpecificationsRepository>();
            services.AddScoped<IExtrasRepository, ExtrasRepository>();
            services.AddScoped<IPublicProjectRepository, PublicProjectRepository>();

            return services;
        }

    }
}
