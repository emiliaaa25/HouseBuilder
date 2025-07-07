using Application.DTOs;
using Domain.Common;
using Domain.Entities;
using MediatR;

namespace Application.Use_Cases.Commands.HouseSpecifications
{
    public class UpdateHouseSpecificationsCommand: IRequest<Result<Unit>>
    {
        public Guid Id { get; set; }
        public Guid ProjectId { get; set; }
        public RoofType RoofType { get; set; }
        public HouseShapeType ShapeType { get; set; }

        public float? Length { get; set; }
        public float? Width { get; set; }
        public float? Size { get; set; }

        // L-Shape
        public float? MainLength { get; set; }
        public float? MainWidth { get; set; }
        public float? ExtensionLength { get; set; }
        public float? ExtensionWidth { get; set; }

        // T-Shape
        public float? CrossLength { get; set; }
        public float? CrossWidth { get; set; }

        // U-Shape
        public float? BaseLength { get; set; }
        public float? BaseWidth { get; set; }
        public float? LeftWingLength { get; set; }
        public float? LeftWingWidth { get; set; }
        public float? RightWingLength { get; set; }
        public float? RightWingWidth { get; set; }

        public MaterialSpecificationDto WallMaterial { get; set; }
        public MaterialSpecificationDto RoofMaterial { get; set; }
        public MaterialSpecificationDto FloorMaterial { get; set; }
        public string MaterialCustomizations { get; set; }

        public int NumFloors { get; set; }

        public List<Floor> Floors { get; set; }

    }
}
