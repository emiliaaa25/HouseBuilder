using Application.DTOs;
using Domain.Common;
using MediatR;

namespace Application.Use_Cases.Commands.Extras
{
    public class UpdateExtrasCommand : IRequest<Result<Unit>>
    {
        public Guid Id { get; set; }
        public Guid HouseSpecificationsId { get; set; }
        public List<DoorDto> Doors { get; set; }

        public List<WindowDto> Windows { get; set; }
    }
}
