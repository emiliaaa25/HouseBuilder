using Domain.Common;
using MediatR;

namespace Application.Use_Cases.Commands.Project
{
    public record DeleteProjectCommand(Guid Id) : IRequest<Result<Unit>>
    {

    }
}
