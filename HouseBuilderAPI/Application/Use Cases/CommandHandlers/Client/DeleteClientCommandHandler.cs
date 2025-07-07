using Application.Use_Cases.Commands;
using AutoMapper;
using Domain.Common;
using Domain.Repositories;
using MediatR;

namespace Application.Use_Cases.CommandHandlers
{
    public class DeleteClientCommandHandler : IRequestHandler<DeleteClientCommand, Result<Unit>>
    {
        private readonly IClientRepository repository;
        private readonly IMapper mapper;
        public DeleteClientCommandHandler(IClientRepository repository, IMapper mapper)
        {
            this.repository = repository;
            this.mapper = mapper;
        }
        public async Task<Result<Unit>> Handle(DeleteClientCommand request, CancellationToken cancellationToken)
        {
            var client = await repository.GetByIdAsync(request.Id);
            if (client == null)
            {
                return Result<Unit>.Failure("Client not found");
            }
            await repository.DeleteAsync(client.Id);
            return Result<Unit>.Success(Unit.Value);
        }
    }
}
