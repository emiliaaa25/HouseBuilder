using Domain.Common;
using MediatR;

namespace Application.Use_Cases.Commands.PublicProject
{
    public class ToggleLikeCommand : IRequest<Result<bool>>
    {
        public Guid PublicProjectId { get; set; }
        public Guid UserId { get; set; }
    }
}
