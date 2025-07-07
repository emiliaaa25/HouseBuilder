using Application.DTOs;
using Application.Use_Cases.Queries;
using Application.Use_Cases.Queries.Designer;
using AutoMapper;
using Domain.Repositories;
using MediatR;

namespace Application.Use_Cases.QueryHandlers.Designer
{
    public class GetAllDesignersQueryHandler : IRequestHandler<GetAllDesignersQuery, List<DesignerDto>>
    {
        private readonly IDesignerRepository repository;
        private readonly IMapper mapper;
        public GetAllDesignersQueryHandler(IDesignerRepository repository, IMapper mapper)
        {
            this.repository = repository;
            this.mapper = mapper;
        }
        public async Task<List<DesignerDto>> Handle(GetAllDesignersQuery request, CancellationToken cancellationToken)
        {
            var designers = await repository.GetAllAsync();
            return mapper.Map<List<DesignerDto>>(designers);
        }
    }
}
