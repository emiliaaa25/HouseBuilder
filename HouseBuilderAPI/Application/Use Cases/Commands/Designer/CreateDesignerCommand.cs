namespace Application.Use_Cases.Commands.Designer
{
    public class CreateDesignerCommand : UserCommand<Guid>
    {
        public string ProfessionalLicenseNumber { get; set; }
        public int YearsOfExperience { get; set; }
        public string Specialization { get; set; }
        public string CertificateFilePath { get; set; }
        public VerificationStatus Status { get; set; }
        public string AdminNotes { get; set; }
    }
}
