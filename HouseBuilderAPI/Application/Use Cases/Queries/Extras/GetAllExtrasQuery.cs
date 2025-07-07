using Application.DTOs;
using MediatR;

namespace Application.Use_Cases.Queries.Extras
{
    public class GetAllExtrasQuery : IRequest<List<ExtrasDto>>
    {
        public Guid HouseSpecificationsId { get; set; }
        public GetAllExtrasQuery(Guid houseSpecificationsId)
        {
            HouseSpecificationsId = houseSpecificationsId;
        }
    }
}
