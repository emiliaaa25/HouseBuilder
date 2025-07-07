using Application.Use_Cases.Commands.Designer;
using AutoMapper;
using Domain.Common;
using Domain.Repositories;
using MediatR;

namespace Application.Use_Cases.CommandHandlers.Designer
{
    public class DeleteDesignerCommandHandler : IRequestHandler<DeleteDesignerCommand, Result<Unit>>
    {
        private readonly IDesignerRepository repository;
        private readonly IMapper mapper;
        public DeleteDesignerCommandHandler(IDesignerRepository repository, IMapper mapper)
        {
            this.repository = repository;
            this.mapper = mapper;
        }
        public async Task<Result<Unit>> Handle(DeleteDesignerCommand request, CancellationToken cancellationToken)
        {
            var designer = await repository.GetByIdAsync(request.Id);
            if (designer == null)
            {
                return Result<Unit>.Failure("Designer not found");
            }
            await repository.DeleteAsync(designer.Id);
            return Result<Unit>.Success(Unit.Value);
        }
    }
}
