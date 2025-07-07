using Application.DTOs;
using Application.Use_Cases.Queries.PublicProject;
using AutoMapper;
using Domain.Repositories;
using MediatR;

namespace Application.Use_Cases.QueryHandlers.PublicProject
{
    public class GetPublicProjectsQueryHandler : IRequestHandler<GetPublicProjectsQuery, List<PublicProjectDto>>
    {
        private readonly IPublicProjectRepository repository;
        private readonly IMapper mapper;

        public GetPublicProjectsQueryHandler(IPublicProjectRepository repository, IMapper mapper)
        {
            this.repository = repository;
            this.mapper = mapper;
        }

        public async Task<List<PublicProjectDto>> Handle(GetPublicProjectsQuery request, CancellationToken cancellationToken)
        {
            var publicProjects = await repository.GetAllAsync();

            var sorted = request.SortBy?.ToLower() switch
            {
                "popular" => publicProjects.OrderByDescending(p => p.Views + p.Likes),
                "most_liked" => publicProjects.OrderByDescending(p => p.Likes),
                "most_viewed" => publicProjects.OrderByDescending(p => p.Views),
                _ => publicProjects.OrderByDescending(p => p.PublishedAt)
            };

            var pagedResults = sorted
                .Skip((request.Page - 1) * request.PageSize)
                .Take(request.PageSize)
                .ToList();

            var dtos = mapper.Map<List<PublicProjectDto>>(pagedResults);

            if (request.CurrentUserId.HasValue)
            {
                var likedProjectIds = await repository.GetLikedProjectIdsAsync(request.CurrentUserId.Value);
                foreach (var dto in dtos)
                {
                    dto.IsLikedByCurrentUser = likedProjectIds.Contains(dto.Id);
                }
            }

            return dtos;
        }
    }
}
