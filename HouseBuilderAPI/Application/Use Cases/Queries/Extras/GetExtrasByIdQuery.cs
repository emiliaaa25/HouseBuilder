using Application.DTOs;
using Domain.Common;
using MediatR;

namespace Application.Use_Cases.Queries.Extras
{
    public class GetExtrasByIdQuery : IRequest<Result<ExtrasDto>>
    {
        public Guid Id { get; set; }

        public Guid HouseSpecificationsId { get; set; }
        public GetExtrasByIdQuery(Guid id, Guid houseSpecificationsId)
        {
            Id = id;
            HouseSpecificationsId = houseSpecificationsId;
        }
    }
}
