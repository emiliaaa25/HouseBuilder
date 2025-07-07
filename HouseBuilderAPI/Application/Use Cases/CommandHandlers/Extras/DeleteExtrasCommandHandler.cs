using Application.Use_Cases.Commands.Extras;
using AutoMapper;
using Domain.Common;
using Domain.Repositories;
using MediatR;

namespace Application.Use_Cases.CommandHandlers.Extras
{
    public class DeleteExtrasCommandHandler : IRequestHandler<DeleteExtrasCommand, Result<Unit>>
    {
        private readonly IExtrasRepository repository;
        private readonly IMapper mapper;
        public DeleteExtrasCommandHandler(IExtrasRepository repository, IMapper mapper)
        {
            this.repository = repository;
            this.mapper = mapper;
        }
        public async Task<Result<Unit>> Handle(DeleteExtrasCommand request, CancellationToken cancellationToken)
        {
            var extras = await repository.GetByIdAsync(p => p.Id == request.Id);
            if (extras == null)
            {
                return Result<Unit>.Failure("Extras not found");
            }
            await repository.DeleteAsync(extras.Id);
            return Result<Unit>.Success(Unit.Value);
        }
    }
}
