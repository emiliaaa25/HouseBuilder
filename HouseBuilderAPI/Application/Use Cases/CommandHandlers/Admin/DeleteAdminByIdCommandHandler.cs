using Application.Commands.Administrator;
using Domain.Common;
using Domain.Repositories;
using MediatR;

namespace Application.CommandHandlers.AdminCommandHandlers
{
    public class DeleteAdminByIdCommandHandler : IRequestHandler<DeleteAdminByIdCommand, Result<Unit>>
    {
        private readonly IAdminRepository repository;

        public DeleteAdminByIdCommandHandler(IAdminRepository repository)
        {
            this.repository = repository;
        }

        public async Task<Result<Unit>> Handle(DeleteAdminByIdCommand request, CancellationToken cancellationToken)
        {
            var admin = await repository.GetByIdAsync(request.Id);
            if (admin == null)
            {
                return Result<Unit>.Failure("Admin not found");
            }
            await repository.DeleteAsync(request.Id);
            return Result<Unit>.Success(Unit.Value);
        }
    }
}
