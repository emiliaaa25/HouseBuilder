using Application.DTOs;
using Application.Use_Cases.Queries.HouseSpecifications;
using AutoMapper;
using Domain.Entities;
using Domain.Entities.Shapes;
using Domain.Repositories;
using MediatR;

namespace Application.Use_Cases.QueryHandlers.HouseSpecifications
{
    public class GetAllHouseSpecificationsQueryHandler : IRequestHandler<GetAllHouseSpecificationsQuery, List<HouseSpecificationsDto>>
    {
        private readonly IHouseSpecificationsRepository repository;
        private readonly IMapper mapper;

        public GetAllHouseSpecificationsQueryHandler(IHouseSpecificationsRepository repository, IMapper mapper)
        {
            this.repository = repository;
            this.mapper = mapper;
        }

        public async Task<List<HouseSpecificationsDto>> Handle(GetAllHouseSpecificationsQuery request, CancellationToken cancellationToken)
        {
            var specifications = await repository.GetAllAsync(p => p.ProjectId == request.ProjectId);

            var result = specifications.Select(spec => new HouseSpecificationsDto
            {
                Id = spec.Id,
                ProjectId = spec.ProjectId,
                RoofType = spec.RoofType,
                ShapeType = spec.ShapeType,
                ShapeParameters = spec.ShapeType switch
                {
                    HouseShapeType.Rectangular => new Dictionary<string, float>
                        {
                            { "Length", spec.ShapeParameters is RectangularShapeParameters rect ? rect.Length : 0 },
                            { "Width", spec.ShapeParameters is RectangularShapeParameters rect1 ? rect1.Width : 0 }
                        },
                    HouseShapeType.Square => new Dictionary<string, float>
                        {
                            { "Size", spec.ShapeParameters is SquareShapeParameters square ? square.Size : 0 }
                        },
                    HouseShapeType.LShape => new Dictionary<string, float>
                        {
                            { "MainLength", spec.ShapeParameters is LShapeParameters lShape ? lShape.MainLength : 0 },
                            { "MainWidth", spec.ShapeParameters is LShapeParameters lShape1 ? lShape1.MainWidth : 0 },
                            { "ExtensionLength", spec.ShapeParameters is LShapeParameters lShape2 ? lShape2.ExtensionLength : 0 },
                            { "ExtensionWidth", spec.ShapeParameters is LShapeParameters tShape3 ? tShape3.ExtensionWidth : 0 }
                        },
                    HouseShapeType.TShape => new Dictionary<string, float>
                        {
                            { "MainLength", spec.ShapeParameters is TShapeParameters tShape ? tShape.MainLength : 0 },
                            { "MainWidth", spec.ShapeParameters is TShapeParameters tShape1 ? tShape1.MainWidth : 0 },
                            { "CrossLength", spec.ShapeParameters is TShapeParameters tShape2 ? tShape2.CrossLength : 0 },
                            { "CrossWidth", spec.ShapeParameters is TShapeParameters tShape3 ? tShape3.CrossWidth : 0 }
                        },
                    HouseShapeType.UShape => new Dictionary<string, float>
                        {
                            { "BaseLength", spec.ShapeParameters is UShapeParameters uShape1 ? uShape1.BaseLength : 0 },
                            { "BaseWidth", spec.ShapeParameters is UShapeParameters uShape2 ? uShape2.BaseWidth : 0 },
                            { "LeftWingLength", spec.ShapeParameters is UShapeParameters uShape3 ? uShape3.LeftWingLength : 0 },
                            { "LeftWingWidth", spec.ShapeParameters is UShapeParameters uShape4 ? uShape4.LeftWingWidth : 0 },
                            { "RightWingLength", spec.ShapeParameters is UShapeParameters uShape5 ? uShape5.RightWingLength : 0 },
                            { "RightWingWidth", spec.ShapeParameters is UShapeParameters uShape6 ? uShape6.RightWingWidth : 0 }
                        },
                    _ => throw new ArgumentException($"Shape type {spec.ShapeType} is not supported")
                },
                WallMaterial = new MaterialSpecificationDto
                {
                    Type = spec.WallMaterial.Type,
                    Color = spec.WallMaterial.Color,
                    TexturePath = spec.WallMaterial.TexturePath
                },
                RoofMaterial = new MaterialSpecificationDto
                {
                    Type = spec.RoofMaterial.Type,
                    Color = spec.RoofMaterial.Color,
                    TexturePath = spec.RoofMaterial.TexturePath
                },
                FloorMaterial = new MaterialSpecificationDto
                {
                    Type = spec.FloorMaterial.Type,
                    Color = spec.FloorMaterial.Color,
                    TexturePath = spec.FloorMaterial.TexturePath
                },
                MaterialCustomizations = spec.MaterialCustomizations,
                NumFloors = spec.NumFloors,
                Floors = spec.Floors.Select(f => new Floor
                {
                    Index = f.Index,
                    FloorHeigth = f.FloorHeigth,
                }).ToList()
            }).ToList();
            

            return result;
        }
    }
}
