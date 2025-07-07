using Application.DTOs;
using Application.Use_Cases.Queries;
using AutoMapper;
using Domain.Repositories;
using MediatR;

namespace Application.Use_Cases.QueryHandlers
{
    public class GetAllClientsQueryHandler : IRequestHandler<GetAllClientsQuery, List<ClientDto>>
    {
        private readonly IClientRepository repository;
        private readonly IMapper mapper;
        public GetAllClientsQueryHandler(IClientRepository repository, IMapper mapper)
        {
            this.repository = repository;
            this.mapper = mapper;
        }
        public async Task<List<ClientDto>> Handle(GetAllClientsQuery request, CancellationToken cancellationToken)
        {
            var clients = await repository.GetAllAsync();
            return mapper.Map<List<ClientDto>>(clients);
        }
    }
}
