using Domain.Common;
using MediatR;

namespace Application.Use_Cases.Commands.Extras
{
    public record DeleteExtrasCommand(Guid Id) : IRequest<Result<Unit>>
    {
    }
}
