using Application.DTOs;
using Domain.Common;
using MediatR;

namespace Application.Use_Cases.Queries.Designer
{
    public class GetDesignerByIdQuery : IRequest<Result<DesignerDto>>
    {
        public Guid Id { get; set; }
    }
    
}
