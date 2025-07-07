using Domain.Common;
using MediatR;

namespace Application.Use_Cases.Commands.HouseSpecifications
{
    public record DeleteHouseSpecificationsCommand(Guid Id) : IRequest<Result<Unit>>
    {
    }
}
