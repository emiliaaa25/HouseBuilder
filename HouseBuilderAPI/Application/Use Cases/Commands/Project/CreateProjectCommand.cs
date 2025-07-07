using Domain.Common;
using MediatR;

namespace Application.Use_Cases.Commands
{
    public class CreateProjectCommand : IRequest<Result<Guid>>
    {
        public Guid ConstructorId { get; set; } 
        public string Address { get; set; }
        
        public string Description { get; set; }



    }
}
