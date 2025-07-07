using Application.DTOs;
using MediatR;

namespace Application.Use_Cases.Queries.PublicProject
{
    public class GetPublicProjectsQuery : IRequest<List<PublicProjectDto>>
    {
        public Guid? CurrentUserId { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 12;
        public string? SortBy { get; set; } = "newest"; 
    }
}
