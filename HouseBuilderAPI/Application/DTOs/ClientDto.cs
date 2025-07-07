namespace Application.DTOs
{
    public class ClientDto
    {
        public Guid Id { get; set; }
        public string PictureLink { get; set; }

        public string Username { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public string PhoneNumber { get; set; }
        public required string PasswordHash { get; set; }

    }
}
