using MediatR;

namespace Application.Use_Cases.Commands.Designer
{
    public class UpdateDesignerCommand : UserCommand<Unit>
    {
        public Guid Id { get; set; }
        public string ProfessionalLicenseNumber { get; set; }
        public int YearsOfExperience { get; set; }
        public string Specialization { get; set; }
        public string CertificateFilePath { get; set; }
        public DateTime SubmissionDate { get; set; }
        public VerificationStatus Status { get; set; }
        public string AdminNotes { get; set; }
    }
   
}
