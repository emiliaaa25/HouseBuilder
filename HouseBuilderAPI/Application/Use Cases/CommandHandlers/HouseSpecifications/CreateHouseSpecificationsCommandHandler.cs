using Application.Use_Cases.Commands.HouseSpecifications;
using AutoMapper;
using Domain.Common;
using Domain.Entities;
using Domain.Entities.Shapes;
using Domain.Repositories;
using MediatR;
using NuGet.Protocol.Plugins;

namespace Application.Use_Cases.CommandHandlers.HouseSpecifications
{
    public class CreateHouseSpecificationsCommandHandler : IRequestHandler<CreateHouseSpecificationsCommand, Result<Guid>>
    {
        private readonly IHouseSpecificationsRepository repository;
        private readonly IMapper mapper;

        public CreateHouseSpecificationsCommandHandler(IHouseSpecificationsRepository repository, IMapper mapper)
        {
            this.repository = repository;
            this.mapper = mapper;
        }
        public async Task<Result<Guid>> Handle(CreateHouseSpecificationsCommand request, CancellationToken cancellationToken)
        {
            var specifications = mapper.Map<Domain.Entities.HouseSpecifications>(request);
            switch (request.ShapeType)
            {
                case HouseShapeType.Rectangular:
                    specifications.ShapeParameters = new RectangularShapeParameters
                    {
                        Length = request.Length,
                        Width = request.Width,
                    };
                    break;
                case HouseShapeType.Square:
                    specifications.ShapeParameters = new SquareShapeParameters
                    {
                        Size = request.Size 
                    };
                    break;
                case HouseShapeType.LShape:
                    specifications.ShapeParameters = new LShapeParameters
                    {
                        MainLength = request.MainLength,
                        MainWidth = request.MainWidth,
                        ExtensionLength = request.ExtensionLength,
                        ExtensionWidth = request.ExtensionWidth
                    };
                    break;
                case HouseShapeType.TShape:
                    specifications.ShapeParameters = new TShapeParameters
                    {
                        MainLength = request.MainLength,
                        MainWidth = request.MainWidth,
                        CrossLength = request.CrossLength,
                        CrossWidth = request.CrossWidth
                    };
                    break;
                case HouseShapeType.UShape:
                    specifications.ShapeParameters = new UShapeParameters
                    {
                        BaseLength = request.BaseLength,
                        BaseWidth = request.BaseWidth,
                        LeftWingLength = request.LeftWingLength,
                        LeftWingWidth = request.LeftWingWidth,
                        RightWingLength = request.RightWingLength,
                        RightWingWidth = request.RightWingWidth
                    };
                    break;
            }
            specifications.WallMaterial = new MaterialSpecification
            {
                Type = request.WallMaterial.Type,
                Color = request.WallMaterial.Color,
                TexturePath = request.WallMaterial.TexturePath
            };
            specifications.RoofMaterial = new MaterialSpecification
            {
                Type = request.RoofMaterial.Type,
                Color = request.RoofMaterial.Color,
                TexturePath = request.RoofMaterial.TexturePath
            };
            specifications.FloorMaterial = new MaterialSpecification
            {
                Type = request.FloorMaterial.Type,
                Color = request.FloorMaterial.Color,
                TexturePath = request.FloorMaterial.TexturePath

            };
            specifications.NumFloors = request.NumFloors;
            if (request.Floors != null && request.Floors.Any())
            {
                specifications.Floors = new List<Floor>();
                foreach (var requestFloor in request.Floors)
                {
                    specifications.Floors.Add(new Floor
                    {
                        Index = requestFloor.Index,
                        FloorHeigth = requestFloor.FloorHeigth
                    });
                }
            }
            else
            {
                specifications.Floors = new List<Floor>();
            }
            var result = await repository.AddAsync(specifications);
            if (result.IsSuccess)
            {
                return Result<Guid>.Success(result.Data);
            }
            return Result<Guid>.Failure(result.ErrorMessage);
        }
    }
}
