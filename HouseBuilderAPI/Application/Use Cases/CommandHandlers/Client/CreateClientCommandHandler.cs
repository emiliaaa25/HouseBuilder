using Application.Use_Cases.Commands;
using AutoMapper;
using Domain.Common;
using Domain.Entities;
using Domain.Repositories;
using Domain.Services;
using MediatR;

namespace Application.Use_Cases.CommandHandlers
{
    public class CreateClientCommandHandler : IRequestHandler<CreateClientCommand, Result<Guid>>
    {
        private readonly IClientRepository repository;
        private readonly IMapper mapper;

        public CreateClientCommandHandler(IClientRepository repository, IMapper mapper)
        {
            this.repository = repository;
            this.mapper = mapper;
        }
        public async Task<Result<Guid>> Handle(CreateClientCommand request, CancellationToken cancellationToken)
        {
            var client = mapper.Map<Client>(request);
            client.PasswordHash = PasswordHasher.HashPassword(request.PasswordHash);

            var result = await repository.AddAsync(client);
            if (result.IsSuccess)
            {
                return Result<Guid>.Success(result.Data);
            }
            return Result<Guid>.Failure(result.ErrorMessage);
        }
    }
}