using System.Linq.Expressions;
using Domain.Common;
using Domain.Entities;
using Domain.Repositories;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace Infrastructure
{
    public class HouseSpecificationsRepository : IHouseSpecificationsRepository
    {
        private readonly ApplicationDbContext context;
        private readonly IConfiguration configuration;

        public HouseSpecificationsRepository(ApplicationDbContext context, IConfiguration configuration)
        {
            this.context = context;
            this.configuration = configuration;
        }

        public async Task<Result<Guid>> AddAsync(HouseSpecifications specifications)
        {
            try
            {
                await context.Specifications.AddAsync(specifications);
                await context.SaveChangesAsync();
                return Result<Guid>.Success(specifications.Id);
            }
            catch (Exception ex)
            {
                return Result<Guid>.Failure(ex.InnerException!.ToString());
            }
        }

        public async Task DeleteAsync(Guid id)
        {
            var specifications = await context.Specifications.FindAsync(id);
            if (specifications is not null)
            {
                context.Specifications.Remove(specifications);
                await context.SaveChangesAsync();
            }
        }

        public async Task<IEnumerable<HouseSpecifications>> GetAllAsync(Expression<Func<HouseSpecifications, bool>>? filter = null)
        {
            IQueryable<HouseSpecifications> query = context.Specifications;


            if (filter != null)
            {
                query = query.Where(filter);
            }

            return await query.ToListAsync();
        }

        public async Task<HouseSpecifications?> GetByIdAsync(Expression<Func<HouseSpecifications, bool>> filter)
        {
            var spec = await context.Specifications
                .FirstOrDefaultAsync(filter);

            if (spec != null && spec.NumFloors > 0 && spec.Floors == null)
            {
                spec.Floors = new List<Floor>();
            }

            return spec;
        }
        public Task UpdateAsync(HouseSpecifications specifications)
        {
            context.Specifications.Update(specifications);
            return context.SaveChangesAsync();
        }
    }
}
