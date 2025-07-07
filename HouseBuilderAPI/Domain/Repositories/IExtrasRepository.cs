using System.Linq.Expressions;
using Domain.Common;
using Domain.Entities;

namespace Domain.Repositories
{
    public interface IExtrasRepository
    {
        Task<Result<Guid>> AddAsync(Extras extras);
        Task<Extras?> GetByIdAsync(Expression<Func<Extras, bool>> filter);

        Task<IEnumerable<Extras>> GetAllAsync(Expression<Func<Extras, bool>>? filter = null);
        Task UpdateAsync(Extras specifications);
        Task DeleteAsync(Guid id);



    }
}
