using Application.DTOs;
using Application.Use_Cases.Queries.PublicProject;
using AutoMapper;
using Domain.Common;
using Domain.Repositories;
using MediatR;

namespace Application.Use_Cases.QueryHandlers.PublicProject
{
    public class GetPublicProjectByIdQueryHandler : IRequestHandler<GetPublicProjectByIdQuery, Result<PublicProjectDto>>
    {
        private readonly IPublicProjectRepository repository;
        private readonly IMapper mapper;

        public GetPublicProjectByIdQueryHandler(IPublicProjectRepository repository, IMapper mapper)
        {
            this.repository = repository;
            this.mapper = mapper;
        }

        public async Task<Result<PublicProjectDto>> Handle(GetPublicProjectByIdQuery request, CancellationToken cancellationToken)
        {
            var publicProject = await repository.GetByIdAsync(request.Id);
            if (publicProject == null)
            {
                return Result<PublicProjectDto>.Failure("Public project not found");
            }

            await repository.IncrementViewAsync(request.Id, request.CurrentUserId, request.IpAddress);

            publicProject = await repository.GetByIdAsync(request.Id);

            var dto = mapper.Map<PublicProjectDto>(publicProject);

            if (request.CurrentUserId.HasValue)
            {
                dto.IsLikedByCurrentUser = await repository.IsLikedByUserAsync(request.Id, request.CurrentUserId.Value);
            }

            return Result<PublicProjectDto>.Success(dto);
        }
    }
}
