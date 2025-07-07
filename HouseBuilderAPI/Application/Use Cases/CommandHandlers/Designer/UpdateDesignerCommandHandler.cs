using Application.Use_Cases.Commands.Designer;
using AutoMapper;
using Domain.Common;
using Domain.Repositories;
using MediatR;

namespace Application.Use_Cases.CommandHandlers.Designer
{
    public class UpdateDesignerCommandHandler : IRequestHandler<UpdateDesignerCommand, Result<Unit>>
    {
        private readonly IDesignerRepository repository;
        private readonly IMapper mapper;
        public UpdateDesignerCommandHandler(IDesignerRepository repository, IMapper mapper)
        {
            this.repository = repository;
            this.mapper = mapper;
        }
        public async Task<Result<Unit>> Handle(UpdateDesignerCommand request, CancellationToken cancellationToken)
        {
            var designer = await repository.GetByIdAsync(request.Id);
            if (designer == null)
            {
                return Result<Unit>.Failure("Designer not found");
            }
            var updatedDesigner = mapper.Map(request, designer);
            await repository.UpdateAsync(updatedDesigner);
            return Result<Unit>.Success(Unit.Value);
        }
    }
}
