using Application.Use_Cases.Commands.PublicProject;
using Domain.Common;
using Domain.Repositories;
using MediatR;

namespace Application.Use_Cases.CommandHandlers.PublicProject
{
    public class DeletePublicProjectCommandHandler : IRequestHandler<DeletePublicProjectCommand, Result<bool>>
    {
        private readonly IPublicProjectRepository publicProjectRepository;
        private readonly IProjectRepository projectRepository;

        public DeletePublicProjectCommandHandler(
            IPublicProjectRepository publicProjectRepository,
            IProjectRepository projectRepository)
        {
            this.publicProjectRepository = publicProjectRepository;
            this.projectRepository = projectRepository;
        }

        public async Task<Result<bool>> Handle(DeletePublicProjectCommand request, CancellationToken cancellationToken)
        {
            var project = await projectRepository.GetByIdAsync(p => p.Id == request.ProjectId && p.ConstructorId == request.UserId);
            if (project == null)
            {
                return Result<bool>.Failure("Project not found or you don't have permission");
            }

            var publicProject = await publicProjectRepository.GetByProjectIdAsync(request.ProjectId);
            if (publicProject == null)
            {
                return Result<bool>.Failure("Public project not found");
            }

            await publicProjectRepository.DeleteAsync(publicProject.Id);
            return Result<bool>.Success(true);
        }
    }
}
