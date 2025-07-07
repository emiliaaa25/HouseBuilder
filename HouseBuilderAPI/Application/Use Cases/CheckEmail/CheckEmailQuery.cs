using MediatR;

namespace Application.Queries
{
    public class CheckEmailQuery : IRequest<bool>
    {
        public string Email { get; set; } = string.Empty;
    }
}
