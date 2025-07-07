using Domain.Common;
using Domain.Entities;

namespace Domain.Repositories
{
    public interface IDesignerRepository
    {
        Task<Result<Guid>> AddAsync(Designer designer);

        Task<IEnumerable<Designer>> GetAllAsync();
        Task<Designer> GetByIdAsync(Guid id);
        Task UpdateAsync(Designer designer);
        Task DeleteAsync(Guid id);
        Task<LoginResponse?> Login(string email, string password);
        Task<bool> ExistsByEmailAsync(string email);
        Task<Designer?> GetByEmailAsync(string email);
        Task<List<Designer>> GetDesignersByVerificationStatus(VerificationStatus? status = null);
    

    }
}
