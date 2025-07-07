using Domain.Entities;
using MediatR;

namespace Application.Use_Cases.Authentification
{
    public class LoginUserCommand : IRequest<LoginResponse>
    {
        public required string Email { get; set; }
        public required string Password { get; set; }
    }
}
