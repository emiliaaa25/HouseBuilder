using Application.Use_Cases.Commands.Extras;
using Application.Use_Cases.Commands.HouseSpecifications;
using AutoMapper;
using Domain.Common;
using Domain.Repositories;
using MediatR;

namespace Application.Use_Cases.CommandHandlers.Extras
{
    public class UpdateExtrasCommandHandler : IRequestHandler<UpdateExtrasCommand, Result<Unit>>
    {
        private readonly IExtrasRepository repository;
        private readonly IMapper mapper;
        public UpdateExtrasCommandHandler(IExtrasRepository repository, IMapper mapper)
        {
            this.repository = repository;
            this.mapper = mapper;
        }
        public async Task<Result<Unit>> Handle(UpdateExtrasCommand request, CancellationToken cancellationToken)
        {
            var extras = await repository.GetByIdAsync(p => p.Id == request.Id);
            if (extras == null)
            {
                return Result<Unit>.Failure("Extras not found");
            }
            var updated = mapper.Map(request, extras);
            await repository.UpdateAsync(updated);
            return Result<Unit>.Success(Unit.Value);
        }
    }

}
