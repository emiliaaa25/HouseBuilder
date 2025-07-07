using Application.DTOs;
using Application.Use_Cases.Queries;
using Application.Use_Cases.Queries.Project;
using AutoMapper;
using Domain.Repositories;
using MediatR;

namespace Application.Use_Cases.QueryHandlers.Project
{
    public class GetAllProjectsQueryHandler : IRequestHandler<GetAllProjectsQuery, List<ProjectDto>>
    {
        private readonly IProjectRepository repository;
        private readonly IMapper mapper;
        public GetAllProjectsQueryHandler(IProjectRepository repository, IMapper mapper)
        {
            this.repository = repository;
            this.mapper = mapper;
        }
        public async Task<List<ProjectDto>> Handle(GetAllProjectsQuery request, CancellationToken cancellationToken)
        {
            var projects = await repository.GetAllAsync(p => p.ConstructorId == request.ClientId);
            return mapper.Map<List<ProjectDto>>(projects);
        }
    }
}
