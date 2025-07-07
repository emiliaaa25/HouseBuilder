using Domain.Common;
using MediatR;

namespace Application.Use_Cases.Commands.Designer
{
    public class UpdateDesignerPasswordCommand : IRequest<Result<Unit>>
    {
        public Guid DesignerId { get; set; }
        public required string CurrentPassword { get; set; }

        public required string Password { get; set; }
    }
}
