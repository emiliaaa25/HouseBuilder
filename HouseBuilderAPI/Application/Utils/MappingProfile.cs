using Application.Commands.Administrator;
using Application.DTOs;
using Application.Use_Cases.Commands;
using Application.Use_Cases.Commands.Designer;
using Application.Use_Cases.Commands.Extras;
using Application.Use_Cases.Commands.HouseSpecifications;
using Application.Use_Cases.Commands.Project;
using Application.Use_Cases.Commands.PublicProject;
using AutoMapper;
using Domain.Entities;
using Domain.Entities.Shapes;

namespace Application.Utils
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            CreateMap<Project, ProjectDto>().ReverseMap();
            CreateMap<Client,ClientDto>().ReverseMap();
            CreateMap<Designer, DesignerDto>().ReverseMap();
            CreateMap<CreateClientCommand, Client>().ReverseMap();
            CreateMap<UpdateClientCommand, Client>().ReverseMap();
            CreateMap<CreateProjectCommand, Project>().ReverseMap();
            CreateMap<UpdateProjectCommand, Project>().ReverseMap();
            CreateMap<CreateDesignerCommand, Designer>().ReverseMap();
            CreateMap<UpdateDesignerCommand, Designer>().ReverseMap();
            CreateMap<Admin, AdminDto>().ReverseMap();
            CreateMap<UpdateAdminCommand, Admin>().ReverseMap();
            CreateMap<MaterialSpecification, MaterialSpecificationDto>().ReverseMap();
            CreateMap<CreatePublicProjectCommand, PublicProject>();
            CreateMap<PublicProject, PublicProjectDto>();
            CreateMap<CreatePublicProjectDto, CreatePublicProjectCommand>();

            CreateMap<HouseSpecifications, HouseSpecificationsDto>()
                .ForMember(dest => dest.ShapeParameters, opt => opt.MapFrom(src => ExtractShapeParameters(src.ShapeParameters)))
            .ForMember(dest => dest.Floors, opt => opt.MapFrom(src =>
        src.Floors ?? (src.NumFloors > 0 ? new List<Floor>() : null)));

            CreateMap<CreateHouseSpecificationsCommand, HouseSpecifications>()
                .ForMember(dest => dest.ShapeParameters, opt => opt.MapFrom(src => CreateShapeParameters(src)));

            CreateMap<UpdateHouseSpecificationsCommand, HouseSpecifications>()
                .ForMember(dest => dest.ShapeParameters, opt => opt.MapFrom(src => CreateShapeParameters(src)));

            CreateMap<Extras, ExtrasDto>().ReverseMap();
            CreateMap<Door, DoorDto>().ReverseMap();
            CreateMap<Window, WindowDto>().ReverseMap();

            CreateMap<CreateExtrasCommand, Extras>()
                 .ForMember(dest => dest.Doors, opt => opt.MapFrom(src => src.Doors))
                .ForMember(dest => dest.Windows, opt => opt.MapFrom(src => src.Windows))
                .ReverseMap();
            CreateMap<UpdateExtrasCommand, Extras>().ForMember(dest => dest.Doors, opt => opt.MapFrom(src => src.Doors))
    .ForMember(dest => dest.Windows, opt => opt.MapFrom(src => src.Windows))
    .ReverseMap();
           


        }





        private static Dictionary<string, float> ExtractShapeParameters(HouseShapeParameters parameters)
        {
            var result = new Dictionary<string, float>();

            switch (parameters)
            {
                case RectangularShapeParameters rectangular:
                    result.Add("Length", rectangular.Length);
                    result.Add("Width", rectangular.Width);
                    break;
                case SquareShapeParameters square:
                    result.Add("Size", square.Size);
                    break;
                case LShapeParameters lShape:
                    result.Add("MainLength", lShape.MainLength);
                    result.Add("MainWidth", lShape.MainWidth);
                    result.Add("ExtensionLength", lShape.ExtensionLength);
                    result.Add("ExtensionWidth", lShape.ExtensionWidth);
                    break;
                case TShapeParameters tShape:
                    result.Add("MainLength", tShape.MainLength);
                    result.Add("MainWidth", tShape.MainWidth);
                    result.Add("CrossLength", tShape.CrossLength);
                    result.Add("CrossWidth", tShape.CrossWidth);
                    break;
                case UShapeParameters uShape:
                    result.Add("BaseLength", uShape.BaseLength);
                    result.Add("BaseWidth", uShape.BaseWidth);
                    result.Add("LeftWingLength", uShape.LeftWingLength);
                    result.Add("LeftWingWidth", uShape.LeftWingWidth);
                    result.Add("RightWingLength", uShape.RightWingLength);
                    result.Add("RightWingWidth", uShape.RightWingWidth);
                    break;
            }

            return result;
        }

        private static HouseShapeParameters CreateShapeParameters(CreateHouseSpecificationsCommand src)
        {
            return src.ShapeType switch
            {
                HouseShapeType.Rectangular => new RectangularShapeParameters
                {
                    Length = src.Length,
                    Width = src.Width
                },
                HouseShapeType.Square => new SquareShapeParameters
                {
                    Size = src.Size
                },
                HouseShapeType.LShape => new LShapeParameters
                {
                    MainLength = src.MainLength,
                    MainWidth = src.MainWidth,
                    ExtensionLength = src.ExtensionLength,
                    ExtensionWidth = src.ExtensionWidth
                },
                HouseShapeType.TShape => new TShapeParameters
                {
                    MainLength = src.MainLength,
                    MainWidth = src.MainWidth,
                    CrossLength = src.CrossLength,
                    CrossWidth = src.CrossWidth
                },
                HouseShapeType.UShape => new UShapeParameters
                {
                    BaseLength = src.BaseLength,
                    BaseWidth = src.BaseWidth,
                    LeftWingLength = src.LeftWingLength,
                    LeftWingWidth = src.LeftWingWidth,
                    RightWingLength = src.RightWingLength,
                    RightWingWidth = src.RightWingWidth 
                },
                _ => throw new ArgumentException($"Shape type {src.ShapeType} is not supported")
            };
        }

        private static HouseShapeParameters CreateShapeParameters(UpdateHouseSpecificationsCommand src)
        {
            return src.ShapeType switch
            {
                HouseShapeType.Rectangular => new RectangularShapeParameters
                {
                    Length = src.Length ?? 0,
                    Width = src.Width ?? 0
                },
                HouseShapeType.Square => new SquareShapeParameters
                {
                    Size = src.Size ?? 0
                },
                HouseShapeType.LShape => new LShapeParameters
                {
                    MainLength = src.MainLength ?? 0,
                    MainWidth = src.MainWidth ?? 0,
                    ExtensionLength = src.ExtensionLength ?? 0,
                    ExtensionWidth = src.ExtensionWidth ?? 0
                },
                HouseShapeType.TShape => new TShapeParameters
                {
                    MainLength = src.MainLength ?? 0,
                    MainWidth = src.MainWidth ?? 0,
                    CrossLength = src.CrossLength ?? 0,
                    CrossWidth = src.CrossWidth ?? 0
                },
                HouseShapeType.UShape => new UShapeParameters
                {
                    BaseLength = src.BaseLength ?? 0,
                    BaseWidth = src.BaseWidth ?? 0,
                    LeftWingLength = src.LeftWingLength ?? 0,
                    LeftWingWidth = src.LeftWingWidth ?? 0,
                    RightWingLength = src.RightWingLength ?? 0,
                    RightWingWidth = src.RightWingWidth ?? 0
                },
                _ => throw new ArgumentException($"Shape type {src.ShapeType} is not supported")
            };
        }
    }
}
