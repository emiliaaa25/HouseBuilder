using Application.Use_Cases.Commands;
using AutoMapper;
using Domain.Common;
using Domain.Entities;
using Domain.Repositories;
using MediatR;

namespace Application.Use_Cases.CommandHandlers
{
    public class UpdateClientPasswordCommandHandler : IRequestHandler<UpdateClientPasswordCommand, Result<Unit>>
    {
        private readonly IClientRepository clientRepository;
        private readonly IMapper mapper;

        public UpdateClientPasswordCommandHandler(IClientRepository clientRepository, IMapper mapper)
        {
            this.clientRepository = clientRepository;
            this.mapper = mapper;
        }
        public async Task<Result<Unit>> Handle(UpdateClientPasswordCommand request, CancellationToken cancellationToken)
        {
            var client = await clientRepository.GetByIdAsync(request.ClientId);
            if (client == null)
            {
                return Result<Unit>.Failure("Client not found.");
            }

            if (!BCrypt.Net.BCrypt.Verify(request.CurrentPassword, client.PasswordHash))
            {
                return Result<Unit>.Failure("Current password is incorrect.");
            }

            client.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);
            await clientRepository.UpdateAsync(client);
            return Result<Unit>.Success(Unit.Value);
        }
    }
}
