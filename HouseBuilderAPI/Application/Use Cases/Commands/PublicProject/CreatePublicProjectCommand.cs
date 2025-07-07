using Domain.Common;
using MediatR;

namespace Application.Use_Cases.Commands.PublicProject
{
    public class CreatePublicProjectCommand : IRequest<Result<Guid>>
    {
        public Guid ProjectId { get; set; }
        public string? Thumbnail { get; set; }
        public string? Title { get; set; }
        public string? Description { get; set; }
        public string? AuthorName { get; set; }
    }
}
