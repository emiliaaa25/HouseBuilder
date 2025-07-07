using Application.DTOs;
using MediatR;

namespace Application.Use_Cases.Queries.Project
{
    public class GetAllProjectsQuery :IRequest<List<ProjectDto>>
    {
        public Guid ClientId { get; set; }
        public GetAllProjectsQuery(Guid clientId)
        {
            ClientId = clientId;
        }
    }
}
