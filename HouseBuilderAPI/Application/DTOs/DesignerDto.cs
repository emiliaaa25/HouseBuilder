namespace Application.DTOs
{
    public class DesignerDto 
    {
        public Guid Id { get; set; }
        public string PictureLink { get; set; }

        public string Username { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public string PhoneNumber { get; set; }
        public required string PasswordHash { get; set; }

        public string ProfessionalLicenseNumber { get; set; }
        public int YearsOfExperience { get; set; }
        public string Specialization { get; set; }
        public string CertificateFilePath { get; set; }
        public VerificationStatus Status { get; set; }
        public string AdminNotes { get; set; }
    }
}
