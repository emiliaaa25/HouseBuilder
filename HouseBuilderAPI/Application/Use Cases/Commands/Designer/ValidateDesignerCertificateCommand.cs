using Domain.Common;
using MediatR;

namespace Application.Use_Cases.Commands.Designer
{
    public class ValidateDesignerCertificateCommand : IRequest<Result<bool>>
    {
        public Guid DesignerId { get; set; }
        public VerificationStatus NewStatus { get; set; }
        public string AdminNotes { get; set; }
    }
}
