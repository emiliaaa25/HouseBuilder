using Application.Use_Cases.Queries.PublicProject;
using Domain.Common;
using Domain.Repositories;
using MediatR;

namespace Application.Use_Cases.QueryHandlers.PublicProject
{
    public class CheckProjectIsPublicQueryHandler : IRequestHandler<CheckProjectIsPublicQuery, Result<bool>>
    {
        private readonly IPublicProjectRepository _publicProjectRepository;

        public CheckProjectIsPublicQueryHandler(IPublicProjectRepository publicProjectRepository)
        {
            _publicProjectRepository = publicProjectRepository;
        }

        public async Task<Result<bool>> Handle(CheckProjectIsPublicQuery request, CancellationToken cancellationToken)
        {
            try
            {
                var isPublic = await _publicProjectRepository.IsProjectPublicAsync(request.ProjectId);
                return Result<bool>.Success(isPublic);
            }
            catch (Exception ex)
            {
                return Result<bool>.Failure($"Error checking project status: {ex.Message}");
            }
        }
    }
}
