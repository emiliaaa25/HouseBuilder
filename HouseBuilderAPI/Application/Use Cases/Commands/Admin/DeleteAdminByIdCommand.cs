using Domain.Common;
using MediatR;

namespace Application.Commands.Administrator
{
    public record DeleteAdminByIdCommand(Guid Id) : IRequest<Result<Unit>>;

}
