using Domain.Common;
using MediatR;

namespace Application.Use_Cases.Commands
{
    public record DeleteClientCommand(Guid Id) : IRequest<Result<Unit>>
    {
    }
}
