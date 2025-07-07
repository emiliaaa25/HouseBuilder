using Application.Use_Cases.Commands;
using AutoMapper;
using Domain.Common;
using Domain.Repositories;
using MediatR;

namespace Application.Use_Cases.CommandHandlers
{
    public class UpdateClientCommandHandler : IRequestHandler<UpdateClientCommand, Result<Unit>>
    {
        private readonly IClientRepository repository;
        private readonly IMapper mapper;
        public UpdateClientCommandHandler(IClientRepository repository, IMapper mapper)
        {
            this.repository = repository;
            this.mapper = mapper;
        }
        public async Task<Result<Unit>> Handle(UpdateClientCommand request, CancellationToken cancellationToken)
        {
            var client = await repository.GetByIdAsync(request.Id);
            if (client == null)
            {
                return Result<Unit>.Failure("Client not found");
            }
            var updatedClient = mapper.Map(request, client);
            await repository.UpdateAsync(updatedClient);
            return Result<Unit>.Success(Unit.Value);
        }
    }
}
