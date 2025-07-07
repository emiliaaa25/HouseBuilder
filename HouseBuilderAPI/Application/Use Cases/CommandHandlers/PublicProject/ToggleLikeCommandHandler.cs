using Application.Use_Cases.Commands.PublicProject;
using Domain.Common;
using Domain.Repositories;
using MediatR;

namespace Application.Use_Cases.CommandHandlers.PublicProject
{
    public class ToggleLikeCommandHandler : IRequestHandler<ToggleLikeCommand, Result<bool>>
    {
        private readonly IPublicProjectRepository repository;

        public ToggleLikeCommandHandler(IPublicProjectRepository repository)
        {
            this.repository = repository;
        }

        public async Task<Result<bool>> Handle(ToggleLikeCommand request, CancellationToken cancellationToken)
        {
            return await repository.ToggleLikeAsync(request.PublicProjectId, request.UserId);
        }
    }
}
