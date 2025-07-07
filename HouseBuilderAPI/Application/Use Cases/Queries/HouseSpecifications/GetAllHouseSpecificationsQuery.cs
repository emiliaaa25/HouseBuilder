using Application.DTOs;
using MediatR;

namespace Application.Use_Cases.Queries.HouseSpecifications
{
    public class GetAllHouseSpecificationsQuery : IRequest<List<HouseSpecificationsDto>>
    {
        public Guid ProjectId { get; set; }
        public GetAllHouseSpecificationsQuery(Guid projectId)
        {
            ProjectId = projectId;
        }
    }
}
