using Domain.Common;
using MediatR;

namespace Application.Use_Cases.Commands
{
    public abstract class UserCommand<T> : IRequest<Result<T>>
    {
        public string PictureLink { get; set; }
        public string Username { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public string PhoneNumber { get; set; }
        public string PasswordHash { get; set; }
    }
}
