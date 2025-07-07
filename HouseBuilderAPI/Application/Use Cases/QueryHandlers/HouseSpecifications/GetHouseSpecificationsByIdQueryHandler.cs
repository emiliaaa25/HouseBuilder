using Application.DTOs;
using Application.Use_Cases.Queries.HouseSpecifications;
using AutoMapper;
using Domain.Common;
using Domain.Repositories;
using MediatR;

namespace Application.Use_Cases.QueryHandlers.HouseSpecifications
{
    public class GetHouseSpecificationsByIdQueryHandler : IRequestHandler<GetHouseSpecificationsByIdQuery, Result<HouseSpecificationsDto>>
    {
        private readonly IHouseSpecificationsRepository repository;
        private readonly IMapper mapper;

        public GetHouseSpecificationsByIdQueryHandler(IHouseSpecificationsRepository repository, IMapper mapper)
        {
            this.repository = repository;
            this.mapper = mapper;
        }

        public async Task<Result<HouseSpecificationsDto>> Handle(GetHouseSpecificationsByIdQuery request, CancellationToken cancellationToken)
        {
            var specifications = await repository.GetByIdAsync(p => p.Id == request.Id && p.ProjectId == request.ProjectId);
            if (specifications == null)
            {
                return Result<HouseSpecificationsDto>.Failure("House Specification not found");
            }
            var specificationsDto = mapper.Map<HouseSpecificationsDto>(specifications);
            return Result<HouseSpecificationsDto>.Success(specificationsDto);
        }

    }
}
