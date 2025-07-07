using Application.DTOs;
using Application.Use_Cases.Queries.HouseSpecifications;
using AutoMapper;
using Domain.Entities.Shapes;
using Domain.Entities;
using Domain.Repositories;
using MediatR;
using Application.Use_Cases.Queries.Extras;

namespace Application.Use_Cases.QueryHandlers.Extras
{
    public class GetAllExtrasQueryHandler : IRequestHandler<GetAllExtrasQuery, List<ExtrasDto>>
    {
        private readonly IExtrasRepository repository;
        private readonly IMapper mapper;

        public GetAllExtrasQueryHandler(IExtrasRepository repository, IMapper mapper)
        {
            this.repository = repository;
            this.mapper = mapper;
        }

        public async Task<List<ExtrasDto>> Handle(GetAllExtrasQuery request, CancellationToken cancellationToken)
        {
            var specifications = await repository.GetAllAsync(p => p.HouseSpecificationsId == request.HouseSpecificationsId);

            var result = specifications.Select(spec => new ExtrasDto
            {
                Id = spec.Id,
                HouseSpecificationsId = spec.HouseSpecificationsId,
                Doors = spec.Doors.Select(d => new DoorDto
                {
                    Id = d.Id,
                    Wall = d.Wall,
                    Position = d.Position,
                    Path = d.Path,
                    Thumbnail = d.Thumbnail,
                    Scale = d.Scale != null ? new Scale
                    {
                        X = d.Scale.X,
                        Y = d.Scale.Y,
                        Z = d.Scale.Z
                    } : null
                }).ToList(),
                Windows = spec.Windows.Select(w => new WindowDto
                {
                    Id = w.Id,
                    Wall = w.Wall,
                    Position = w.Position,
                    Position2 = w.Position2,
                    Path = w.Path,
                    Thumbnail = w.Thumbnail,
                    Scale = w.Scale != null ? new Scale
                    {
                        X = w.Scale.X,
                        Y = w.Scale.Y,
                        Z = w.Scale.Z
                    } : null
                }).ToList(),
            }).ToList();

            return result;
        }
    }
}
