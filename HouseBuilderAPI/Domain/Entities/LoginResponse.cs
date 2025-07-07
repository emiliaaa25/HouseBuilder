namespace Domain.Entities
{
    public class LoginResponse
    {
        public required string Token { get; set; }
        public Guid Id { get; set; }
        public required string Role { get; set; }
    }
}
