using Application.DTOs;
using Domain.Common;
using MediatR;

namespace Application.Use_Cases.Queries.Project
{
    public class GetProjectByIdQuery : IRequest<Result<ProjectDto>>
    {
        public Guid Id { get; set; }
        public Guid ConstructorId { get; set; }
        public GetProjectByIdQuery(Guid id, Guid constructorId)
        {
            Id = id;
            ConstructorId = constructorId;
        }
    }
}
