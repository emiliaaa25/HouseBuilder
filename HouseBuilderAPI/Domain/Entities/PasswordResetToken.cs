namespace Domain.Entities
{
    public class PasswordResetToken
    {
        public int Id { get; set; }
        public required string Email { get; set; }
        public required string Token { get; set; }
        public DateTime ExpirationDate { get; set; }
    }
}
