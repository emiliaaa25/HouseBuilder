using Domain.Common;
using MediatR;

namespace Application.Use_Cases.Commands
{
    public class UpdateClientPasswordCommand : IRequest<Result<Unit>>
    {
        public Guid ClientId { get; set; }
        public required string CurrentPassword { get; set; }
        public required string Password { get; set; }
    }
}
