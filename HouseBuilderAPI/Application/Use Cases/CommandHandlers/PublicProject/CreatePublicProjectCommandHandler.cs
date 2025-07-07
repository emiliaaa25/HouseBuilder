using Application.Use_Cases.Commands.PublicProject;
using AutoMapper;
using Domain.Common;
using Domain.Repositories;
using MediatR;

namespace Application.Use_Cases.CommandHandlers.PublicProject
{
    public class CreatePublicProjectCommandHandler : IRequestHandler<CreatePublicProjectCommand, Result<Guid>>
    {
        private readonly IPublicProjectRepository publicProjectRepository;
        private readonly IProjectRepository projectRepository;
        private readonly IMapper mapper;

        public CreatePublicProjectCommandHandler(
            IPublicProjectRepository publicProjectRepository,
            IProjectRepository projectRepository,
            IMapper mapper)
        {
            this.publicProjectRepository = publicProjectRepository;
            this.projectRepository = projectRepository;
            this.mapper = mapper;
        }

        public async Task<Result<Guid>> Handle(CreatePublicProjectCommand request, CancellationToken cancellationToken)
        {
            var project = await projectRepository.GetByIdAsync(p => p.Id == request.ProjectId);
            if (project == null)
            {
                return Result<Guid>.Failure("Project not found");
            }
            var existingPublicProject = await publicProjectRepository.GetByProjectIdAsync(request.ProjectId);
            if (existingPublicProject != null)
            {
                return Result<Guid>.Failure("Project is already public");
            }

            var publicProject = new Domain.Entities.PublicProject
            {
                ProjectId = request.ProjectId,
                Thumbnail = request.Thumbnail,
                Title = request.Title ?? project.Address,
                Description = request.Description ?? project.Description,
                AuthorName = request.AuthorName
            };

            return await publicProjectRepository.AddAsync(publicProject);
        }
    }
}
