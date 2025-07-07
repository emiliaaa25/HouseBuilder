using Application.DTOs;
using Domain.Common;
using MediatR;

namespace Application.Use_Cases.Queries.PublicProject
{
    public class GetPublicProjectByIdQuery : IRequest<Result<PublicProjectDto>>
    {
        public Guid Id { get; set; }
        public Guid? CurrentUserId { get; set; }
        public string? IpAddress { get; set; } 
    }
}
