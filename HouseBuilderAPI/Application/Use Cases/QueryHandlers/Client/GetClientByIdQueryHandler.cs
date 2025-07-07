using Application.DTOs;
using Application.Use_Cases.Queries;
using AutoMapper;
using Domain.Common;
using Domain.Repositories;
using MediatR;

namespace Application.Use_Cases.QueryHandlers
{
    public class GetClientByIdQueryHandler : IRequestHandler<GetClientByIdQuery, Result<ClientDto>>
    {
        private readonly IClientRepository repository;
        private readonly IMapper mapper;

        public GetClientByIdQueryHandler(IClientRepository repository, IMapper mapper)
        {
            this.repository = repository;
            this.mapper = mapper;
        }

        public async Task<Result<ClientDto>> Handle(GetClientByIdQuery request, CancellationToken cancellationToken)
        {
            var client = await repository.GetByIdAsync(request.Id);
            if (client is null)
            {
                return Result<ClientDto>.Failure("Client not found");
            }
            return Result<ClientDto>.Success(mapper.Map<ClientDto>(client));
        }
    }
    
}
