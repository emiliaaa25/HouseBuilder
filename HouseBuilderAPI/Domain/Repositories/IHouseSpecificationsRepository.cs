using System.Linq.Expressions;
using Domain.Common;
using Domain.Entities;


namespace Domain.Repositories
{
    public interface IHouseSpecificationsRepository
    {
        Task<Result<Guid>> AddAsync(HouseSpecifications specifications);
        Task<IEnumerable<HouseSpecifications>> GetAllAsync(Expression<Func<HouseSpecifications, bool>>? filter = null);
        Task<HouseSpecifications?> GetByIdAsync(Expression<Func<HouseSpecifications, bool>> filter);
        Task UpdateAsync(HouseSpecifications specifications);
        Task DeleteAsync(Guid id);
    }
}
