using Domain.Common;
using Domain.Entities;
using MediatR;

namespace Application.Use_Cases.Commands.Project
{
    public class UpdateProjectCommand : IRequest<Result<Unit>>
    {
        public Guid Id { get; set; }
        public Guid ConstructorId { get; set; }
        public string Address { get; set; }
        public string Description { get; set; }
        public ProjectStatus Status { get; set; } = ProjectStatus.Pending;


    }
}
