using Domain.Common;
using MediatR;

namespace Application.Use_Cases.Queries.PublicProject
{
    public class CheckProjectIsPublicQuery : IRequest<Result<bool>>
    {
        public Guid ProjectId { get; set; }
    }
}
