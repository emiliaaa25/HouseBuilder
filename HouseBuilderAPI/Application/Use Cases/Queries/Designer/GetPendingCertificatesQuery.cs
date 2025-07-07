using Application.DTOs;
using MediatR;

namespace Application.Use_Cases.Queries.Designer
{
    public class GetPendingCertificatesQuery : IRequest<List<DesignerDto>>
    {
        public VerificationStatus? StatusFilter { get; set; }
    }
}
