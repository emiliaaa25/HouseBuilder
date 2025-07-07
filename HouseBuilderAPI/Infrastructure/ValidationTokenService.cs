using System.Net;
using System.Security.Cryptography;
using Domain.Entities;
using Domain.Services;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Services
{
    public class ValidationTokenService : IValidationTokenService
    {
        private readonly ApplicationDbContext context;

        public ValidationTokenService(ApplicationDbContext context)
        {
            this.context = context;
        }

        public async Task<string> GenerateResetTokenAsync(string email)
        {
            var token = Convert.ToBase64String(RandomNumberGenerator.GetBytes(32));
            var passwordResetToken = new PasswordResetToken
            {
                Email = email,
                Token = token,
                ExpirationDate = DateTime.UtcNow.AddMinutes(30) 
            };

            context.PasswordResetTokens.Add(passwordResetToken);
            await context.SaveChangesAsync();
            var encodedToken = WebUtility.UrlEncode(token);
            return encodedToken;
        }

        public async Task<bool> ValidateResetTokenAsync(string email, string token)
        {
            Console.WriteLine($"TOKEEEEEEEEEEEEEEEEN : {token}");
            var passwordResetToken = await context.PasswordResetTokens
                .Where(prt => prt.Email == email && prt.Token == token && prt.ExpirationDate > DateTime.UtcNow)
                .FirstOrDefaultAsync();

            return passwordResetToken != null;
        }

        public async Task DeleteResetTokenAsync(string email)
        {
            var passwordResetToken = await context.PasswordResetTokens
                .Where(prt => prt.Email == email)
                .FirstOrDefaultAsync();

            if (passwordResetToken != null)
            {
                context.PasswordResetTokens.Remove(passwordResetToken);
                await context.SaveChangesAsync();
            }
        }
    }
}
