using Domain.Common;
using Domain.Entities;

namespace Domain.Repositories
{
    public interface IClientRepository
    {
        Task<Result<Guid>> AddAsync(Client client);

        Task<IEnumerable<Client>> GetAllAsync();
        Task<Client> GetByIdAsync(Guid id);
        Task UpdateAsync(Client client);
        Task DeleteAsync(Guid id);
        Task<LoginResponse?> Login(string email, string password);
        Task<bool> ExistsByEmailAsync(string email);
        Task<Client?> GetByEmailAsync(string email);

    }
}
