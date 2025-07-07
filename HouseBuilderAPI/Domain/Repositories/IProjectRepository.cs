using System.Linq.Expressions;
using Domain.Common;
using Domain.Entities;

namespace Domain.Repositories
{
    public interface IProjectRepository
    {
        Task<Result<Guid>> AddAsync(Project project);
        Task<IEnumerable<Project>> GetAllAsync(Expression<Func<Project, bool>>? filter = null);
        Task<Project?> GetByIdAsync(Expression<Func<Project, bool>> filter);
        Task UpdateAsync(Project project);
        Task DeleteAsync(Guid id);
    }
}
