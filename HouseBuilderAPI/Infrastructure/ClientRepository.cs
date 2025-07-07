using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Domain.Common;
using Domain.Entities;
using Domain.Repositories;
using Domain.Services;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace Infrastructure
{
    public class ClientRepository : IClientRepository
    {
        private readonly ApplicationDbContext context;
        private readonly IConfiguration configuration;

        public ClientRepository(ApplicationDbContext context, IConfiguration configuration)
        {
            this.context = context;
            this.configuration = configuration;
        }

        public async Task<Result<Guid>> AddAsync(Client client)
        {
            try
            {
                await context.Clients.AddAsync(client);
                await context.SaveChangesAsync();
                return Result<Guid>.Success(client.Id);
            }
            catch (Exception ex)
            {
                return Result<Guid>.Failure(ex.InnerException!.ToString());
            }
        }

        public async Task DeleteAsync(Guid id)
        {
            var client = await context.Clients.FindAsync(id);
            if(client is not null)
            {
                context.Clients.Remove(client);
                await context.SaveChangesAsync();
            }
        }

        public async Task<IEnumerable<Client>> GetAllAsync()
        {
            return await context.Clients.ToListAsync();
        }

        public async Task<Client> GetByIdAsync(Guid id)
        {
            return await context.Clients.FindAsync(id);
        }

        public Task UpdateAsync(Client client)
        {
            context.Clients.Update(client);
            return context.SaveChangesAsync();
        }

        public async Task<LoginResponse?> Login(string email, string password)
        {
            var existingUser = await context.Clients.SingleOrDefaultAsync(x => x.Email == email);
            if (existingUser is null)
            {
                return null;
            }
            if (!PasswordHasher.VerifyPassword(password, existingUser.PasswordHash))
            {
                throw new UnauthorizedAccessException("Invalid credentials");
            }
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(configuration["Jwt:Key"]!);
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
            new Claim(ClaimTypes.Name, existingUser.Id.ToString()),
            new Claim(ClaimTypes.Role, "Client"),
        }),
                Expires = DateTime.UtcNow.AddHours(3),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };
            var token = tokenHandler.CreateToken(tokenDescriptor);
            var tokenString = tokenHandler.WriteToken(token);

            return new LoginResponse
            {
                Token = tokenString,
                Id = existingUser.Id,
                Role = "Client"
            };
        }
        public async Task<bool> ExistsByEmailAsync(string email)
        {
            return await context.Clients.AnyAsync(p => p.Email == email);
        }
        public async Task<Client?> GetByEmailAsync(string email)
        {
            return await context.Clients.FirstOrDefaultAsync(p => p.Email == email);
        }


    }
}
