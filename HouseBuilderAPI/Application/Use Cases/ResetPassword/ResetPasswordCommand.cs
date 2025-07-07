using Domain.Common;
using MediatR;

namespace Application.Use_Cases.ResetPassword
{
    public class ResetPasswordCommand : IRequest<Result<Unit>>
    {
        public required string Email { get; set; }
        public required string Token { get; set; }
        public required string NewPassword { get; set; }
    }
}
