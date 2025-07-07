using System.Linq.Expressions;
using Domain.Common;
using Domain.Entities;
using Domain.Repositories;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace Infrastructure
{
    public class ProjectRepository : IProjectRepository
    {
        private readonly ApplicationDbContext context;
        private readonly IConfiguration configuration;

        public ProjectRepository(ApplicationDbContext context, IConfiguration configuration)
        {
            this.context = context;
            this.configuration = configuration;
        }
  
        public async Task<Result<Guid>> AddAsync(Project project)
        {
            try
            {
                await context.Projects.AddAsync(project);
                await context.SaveChangesAsync();
                return Result<Guid>.Success(project.Id);
            }
            catch (Exception ex)
            {
                return Result<Guid>.Failure(ex.InnerException!.ToString());
            }
        }

        public async Task DeleteAsync(Guid id)
        {
            var project = await context.Projects.FindAsync(id);
            if (project is not null)
            {
                context.Projects.Remove(project);
                await context.SaveChangesAsync();
            }
        }

        public async Task<IEnumerable<Project>> GetAllAsync(Expression<Func<Project, bool>>? filter = null)
        {
            IQueryable<Project> query = context.Projects;
                            

            if (filter != null)
            {
                query = query.Where(filter);
            }

            return await query.ToListAsync();
        }

        public async Task<Project?> GetByIdAsync(Expression<Func<Project, bool>> filter)
        {
            return await context.Projects.FirstOrDefaultAsync(filter);
        }

        public Task UpdateAsync(Project project)
        {
            context.Projects.Update(project);
            return context.SaveChangesAsync();
        }
    }
}
