using System.Linq.Expressions;
using Domain.Common;
using Domain.Entities;
using Domain.Repositories;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace Infrastructure
{
    public class ExtrasRepository : IExtrasRepository
    {
        private readonly ApplicationDbContext context;
        private readonly IConfiguration configuration;

        public ExtrasRepository(ApplicationDbContext context, IConfiguration configuration)
        {
            this.context = context;
            this.configuration = configuration;
        }

        public async Task<Result<Guid>> AddAsync(Extras extras)
        {
            try
            {
                await context.Extras.AddAsync(extras);
                await context.SaveChangesAsync();
                return Result<Guid>.Success(extras.Id);
            }
            catch (Exception ex)
            {
                return Result<Guid>.Failure(ex.InnerException!.ToString());
            }
        }

        public async Task<Extras?> GetByIdAsync(Expression<Func<Extras, bool>> filter)
        {
            var spec = await context.Extras
                .FirstOrDefaultAsync(filter);
            return spec;
        }
        public async Task<IEnumerable<Extras>> GetAllAsync(Expression<Func<Extras, bool>>? filter = null)
        {
            IQueryable<Extras> query = context.Extras;


            if (filter != null)
            {
                query = query.Where(filter);
            }

            return await query.ToListAsync();
        }

        public async Task DeleteAsync(Guid id)
        {
            var specifications = await context.Extras.FindAsync(id);
            if (specifications is not null)
            {
                context.Extras.Remove(specifications);
                await context.SaveChangesAsync();
            }
        }
        public Task UpdateAsync(Extras specifications)
        {
            context.Extras.Update(specifications);
            return context.SaveChangesAsync();
        }

    }
}
