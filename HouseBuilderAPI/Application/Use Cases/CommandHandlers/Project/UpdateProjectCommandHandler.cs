using Application.Use_Cases.Commands.Project;
using AutoMapper;
using Domain.Common;
using Domain.Repositories;
using MediatR;

namespace Application.Use_Cases.CommandHandlers.Project
{
    public class UpdateProjectCommandHandler : IRequestHandler<UpdateProjectCommand, Result<Unit>>
    {
        private readonly IProjectRepository repository;
        private readonly IMapper mapper;
        public UpdateProjectCommandHandler(IProjectRepository repository, IMapper mapper)
        {
            this.repository = repository;
            this.mapper = mapper;
        }
        public async Task<Result<Unit>> Handle(UpdateProjectCommand request, CancellationToken cancellationToken)
        {
            var project = await repository.GetByIdAsync(p => p.Id == request.Id);
            if (project == null)
            {
                return Result<Unit>.Failure("Project not found");
            }
            var updatedProject = mapper.Map(request, project);
            await repository.UpdateAsync(updatedProject);
            return Result<Unit>.Success(Unit.Value);
        }
    }
}
