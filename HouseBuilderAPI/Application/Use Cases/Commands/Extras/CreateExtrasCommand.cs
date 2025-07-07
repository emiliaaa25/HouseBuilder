using Application.DTOs;
using Domain.Common;
using MediatR;

namespace Application.Use_Cases.Commands.Extras
{
    public class CreateExtrasCommand : IRequest<Result<Guid>>
    {
        public Guid HouseSpecificationsId { get; set; }
        public List<DoorDto> Doors { get; set; }
        public List<WindowDto> Windows { get; set; }

    }
}
