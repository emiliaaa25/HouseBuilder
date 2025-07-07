using Domain.Common;
using MediatR;

namespace Application.Use_Cases.Commands.Designer
{
    public record DeleteDesignerCommand (Guid Id) : IRequest<Result<Unit>>
    {
    }
}
