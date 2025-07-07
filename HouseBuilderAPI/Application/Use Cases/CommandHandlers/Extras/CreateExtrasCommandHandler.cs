using Application.Use_Cases.Commands.Extras;
using AutoMapper;
using Domain.Common;
using Domain.Entities;
using Domain.Repositories;
using MediatR;

namespace Application.Use_Cases.CommandHandlers.Extras
{
        public class CreateExtrasCommandHandler : IRequestHandler<CreateExtrasCommand, Result<Guid>>
        {
            private readonly IExtrasRepository repository;
            private readonly IMapper mapper;

            public CreateExtrasCommandHandler(IExtrasRepository repository, IMapper mapper)
            {
                this.repository = repository;
                this.mapper = mapper;
            }

        public async Task<Result<Guid>> Handle(CreateExtrasCommand request, CancellationToken cancellationToken)
        {
            var extras = new Domain.Entities.Extras
            {
                Id = Guid.NewGuid(),
                HouseSpecificationsId = request.HouseSpecificationsId,
                Doors = new List<Door>(),
                Windows = new List<Window>()
            };

            if (request.Doors != null && request.Doors.Any())
            {
                foreach (var requestDoor in request.Doors)
                {
                    extras.Doors.Add(new Door
                    {
                        Id = Guid.NewGuid(),
                        Wall = requestDoor.Wall,
                        Position = requestDoor.Position,
                        Path = requestDoor.Path,
                        Thumbnail = requestDoor.Thumbnail,
                        Scale = requestDoor.Scale != null ? new Scale
                        {
                            X = requestDoor.Scale.X,
                            Y = requestDoor.Scale.Y,
                            Z = requestDoor.Scale.Z
                        } : null
                    });
                }
            }

            if (request.Windows != null && request.Windows.Any())
            {
                foreach (var requestWindow in request.Windows)
                {
                    extras.Windows.Add(new Window
                    {
                        Id = Guid.NewGuid(),
                        Wall = requestWindow.Wall,
                        Position = requestWindow.Position,
                        Position2 = requestWindow.Position2,
                        Path = requestWindow.Path,
                        Thumbnail = requestWindow.Thumbnail,
                        Scale = requestWindow.Scale != null ? new Scale
                        {
                            X = requestWindow.Scale.X,
                            Y = requestWindow.Scale.Y,
                            Z = requestWindow.Scale.Z
                        } : null
                    });
                }
            }
            var result = await repository.AddAsync(extras);
            if (result.IsSuccess)
            {
                return Result<Guid>.Success(result.Data);
            }
            return Result<Guid>.Failure(result.ErrorMessage);
        }
    }
}
    

