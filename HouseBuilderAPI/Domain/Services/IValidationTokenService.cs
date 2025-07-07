namespace Domain.Services
{
    public interface IValidationTokenService
    {
        Task<string> GenerateResetTokenAsync(string email);
        Task<bool> ValidateResetTokenAsync(string email, string token);
        Task DeleteResetTokenAsync(string email);
    }
}
