using Application.DTOs;
using Domain.Common;
using MediatR;

namespace Application.Use_Cases.Queries.HouseSpecifications
{
    public class GetHouseSpecificationsByIdQuery : IRequest<Result<HouseSpecificationsDto>>
    {
        public Guid Id { get; set; }

        public Guid ProjectId { get; set; }
        public GetHouseSpecificationsByIdQuery(Guid id, Guid projectId)
        {
            Id = id;
            ProjectId = projectId;
        }
    }
}
