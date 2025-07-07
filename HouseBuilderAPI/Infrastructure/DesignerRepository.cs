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
    public class DesignerRepository : IDesignerRepository
    {
        private readonly ApplicationDbContext context;
        private readonly IConfiguration configuration;

        public DesignerRepository(ApplicationDbContext context, IConfiguration configuration)
        {
            this.context = context;
            this.configuration = configuration;
        }

        public async Task<Result<Guid>> AddAsync(Designer designer)
        {
            try
            {
                await context.Designers.AddAsync(designer);
                await context.SaveChangesAsync();
                return Result<Guid>.Success(designer.Id);
            }
            catch (Exception ex)
            {
                return Result<Guid>.Failure(ex.InnerException!.ToString());
            }
        }

        public async Task DeleteAsync(Guid id)
        {
            var designer = await context.Designers.FindAsync(id);
            if (designer is not null)
            {
                context.Designers.Remove(designer);
                await context.SaveChangesAsync();
            }
        }

        public async Task<IEnumerable<Designer>> GetAllAsync()
        {
            return await context.Designers.ToListAsync();
        }

        public async Task<Designer> GetByIdAsync(Guid id)
        {
            return await context.Designers.FindAsync(id);
        }

        public Task UpdateAsync(Designer designer)
        {
            context.Designers.Update(designer);
            return context.SaveChangesAsync();
        }

        public async Task<LoginResponse?> Login(string email, string password)
        {
            var existingUser = await context.Designers.SingleOrDefaultAsync(x => x.Email == email);
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
            new Claim(ClaimTypes.Role, "Specialist"),
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
                Role = "Specialist"
            };
        }
        public async Task<bool> ExistsByEmailAsync(string email)
        {
            return await context.Designers.AnyAsync(p => p.Email == email);
        }
        public async Task<Designer?> GetByEmailAsync(string email)
        {
            return await context.Designers.FirstOrDefaultAsync(p => p.Email == email);
        }
        public async Task<List<Designer>> GetDesignersByVerificationStatus(VerificationStatus? status = null)
        {
            IQueryable<Designer> query = context.Designers;

            if (status.HasValue)
            {
                query = query.Where(d => d.Status == status.Value);
            }

            return await query.ToListAsync();
        }
     
    }
}
