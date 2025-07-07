using Application.Use_Cases.Commands.Designer;
using AutoMapper;
using Domain.Common;
using Domain.Repositories;
using MediatR;

namespace Application.Use_Cases.CommandHandlers.Designer
{
    public class UpdateDesignerPasswordCommandHandler : IRequestHandler<UpdateDesignerPasswordCommand, Result<Unit>>
    {
        private readonly IDesignerRepository designerRepository;
        private readonly IMapper mapper;

        public UpdateDesignerPasswordCommandHandler(IDesignerRepository designerRepository, IMapper mapper)
        {
            this.designerRepository = designerRepository;
            this.mapper = mapper;
        }
        public async Task<Result<Unit>> Handle(UpdateDesignerPasswordCommand request, CancellationToken cancellationToken)
        {
            var designer = await designerRepository.GetByIdAsync(request.DesignerId);
            if (designer == null)
            {
                return Result<Unit>.Failure("Designer not found.");
            }
            if (!BCrypt.Net.BCrypt.Verify(request.CurrentPassword, designer.PasswordHash))
            {
                return Result<Unit>.Failure("Current password is incorrect.");
            }


            designer.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);
            await designerRepository.UpdateAsync(designer);
            return Result<Unit>.Success(Unit.Value);
        }
    }
}
