using Application.DTOs;
using Application.Use_Cases.Queries.Extras;
using AutoMapper;
using Domain.Common;
using Domain.Repositories;
using MediatR;

namespace Application.Use_Cases.QueryHandlers.Extras
{
    public class GetExtrasByIdQueryHandler : IRequestHandler<GetExtrasByIdQuery, Result<ExtrasDto>>
    {
        private readonly IExtrasRepository repository;
        private readonly IMapper mapper;

        public GetExtrasByIdQueryHandler(IExtrasRepository repository, IMapper mapper)
        {
            this.repository = repository;
            this.mapper = mapper;
        }

        public async Task<Result<ExtrasDto>> Handle(GetExtrasByIdQuery request, CancellationToken cancellationToken)
        {
            var specifications = await repository.GetByIdAsync(p => p.Id == request.Id && p.HouseSpecificationsId == request.HouseSpecificationsId);
            if (specifications == null)
            {
                return Result<ExtrasDto>.Failure("House Specification not found");
            }
            var specificationsDto = mapper.Map<ExtrasDto>(specifications);
            return Result<ExtrasDto>.Success(specificationsDto);
        }
    }
}
