using Domain.Common;
using MediatR;

namespace Application.Use_Cases.Commands.PublicProject
{
    public class DeletePublicProjectCommand : IRequest<Result<bool>>
    {
        public Guid ProjectId { get; set; }
        public Guid UserId { get; set; } 
    }
}
