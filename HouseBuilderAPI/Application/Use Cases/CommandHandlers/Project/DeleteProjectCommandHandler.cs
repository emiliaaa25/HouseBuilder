using Application.Use_Cases.Commands.Project;
using AutoMapper;
using Domain.Common;
using Domain.Repositories;
using MediatR;

namespace Application.Use_Cases.CommandHandlers.Project
{
    public class DeleteProjectCommandHandler : IRequestHandler<DeleteProjectCommand, Result<Unit>>
    {
        private readonly IProjectRepository repository;
        private readonly IMapper mapper;
        public DeleteProjectCommandHandler(IProjectRepository repository, IMapper mapper)
        {
            this.repository = repository;
            this.mapper = mapper;
        }
        public async Task<Result<Unit>> Handle(DeleteProjectCommand request, CancellationToken cancellationToken)
        {
            var project = await repository.GetByIdAsync(p => p.Id == request.Id);
            if (project == null)
            {
                return Result<Unit>.Failure("Project not found");
            }
            await repository.DeleteAsync(project.Id);
            return Result<Unit>.Success(Unit.Value);
        }
    }
}
