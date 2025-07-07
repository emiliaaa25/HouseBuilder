namespace Domain.Entities
{
    public class Designer : User
    {
        public string ProfessionalLicenseNumber { get; set; }
        public int YearsOfExperience { get; set; }
        public string Specialization { get; set; }
        public string CertificateFilePath { get; set; }
        public VerificationStatus Status { get; set; }
        public string AdminNotes { get; set; }

    }
}
public enum VerificationStatus
{
    Pending,
    Approved,
    Rejected,
    AdditionalInfoRequested
}
