using Application.DTOs;
using Application.Use_Cases.Queries.Project;
using AutoMapper;
using Domain.Common;
using Domain.Repositories;
using MediatR;

namespace Application.Use_Cases.QueryHandlers.Project
{
    public class GetProjectByIdQueryHandler : IRequestHandler<GetProjectByIdQuery, Result<ProjectDto>>
    {
        private readonly IProjectRepository repository;
        private readonly IMapper mapper;

        public GetProjectByIdQueryHandler(IProjectRepository repository, IMapper mapper)
        {
            this.repository = repository;
            this.mapper = mapper;
        }
        public async Task<Result<ProjectDto>> Handle(GetProjectByIdQuery request, CancellationToken cancellationToken)
        {
            var project = await repository.GetByIdAsync(p => p.Id == request.Id && p.ConstructorId == request.ConstructorId);
            if (project is null)
            {
                return Result<ProjectDto>.Failure("Project not found");
            }
            
            return Result<ProjectDto>.Success(mapper.Map<ProjectDto>(project));
        }
    }
}
