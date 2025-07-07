using Domain.Common;
using Domain.Entities;
using System.Linq.Expressions;

namespace Domain.Repositories
{
    public interface IPublicProjectRepository
    {
        Task<Result<Guid>> AddAsync(PublicProject publicProject);
        Task<IEnumerable<PublicProject>> GetAllAsync(Expression<Func<PublicProject, bool>>? filter = null);
        Task<PublicProject?> GetByIdAsync(Guid id);
        Task<PublicProject?> GetByProjectIdAsync(Guid projectId);
        Task UpdateAsync(PublicProject publicProject);
        Task DeleteAsync(Guid id);
        Task<bool> IsProjectPublicAsync(Guid projectId);

        Task<Result<bool>> ToggleLikeAsync(Guid publicProjectId, Guid userId);
        Task<bool> IsLikedByUserAsync(Guid publicProjectId, Guid userId);
        Task<List<Guid>> GetLikedProjectIdsAsync(Guid userId);

        Task IncrementViewAsync(Guid publicProjectId, Guid? userId = null, string? ipAddress = null);
    }
}
