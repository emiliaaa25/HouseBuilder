using Domain.Common;
using Domain.Repositories;
using Domain.Services;
using MediatR;

namespace Application.Use_Cases.ResetPassword
{
    internal class ResetPasswordCommandHandler : IRequestHandler<ResetPasswordCommand, Result<Unit>>
    {
        private readonly IClientRepository repository;
        private readonly IDesignerRepository repository1;
        private readonly IValidationTokenService tokenService;

        public ResetPasswordCommandHandler(IClientRepository repository, IDesignerRepository repository1, IValidationTokenService tokenService)
        {
            this.repository = repository;
            this.repository1 = repository1;
            this.tokenService = tokenService;
        }

        public async Task<Result<Unit>> Handle(ResetPasswordCommand request, CancellationToken cancellationToken)
        {
            if (!await tokenService.ValidateResetTokenAsync(request.Email, request.Token))
            {
                return Result<Unit>.Failure("Invalid token");
            }

            var client = await repository.GetByEmailAsync(request.Email);
            var designer = await repository1.GetByEmailAsync(request.Email);

            if (client != null && designer != null)
            {
                return Result<Unit>.Failure("Email exists in both Client and Designer repositories.");
            }

            if (client != null)
            {
                client.PasswordHash = PasswordHasher.HashPassword(request.NewPassword);
                await repository.UpdateAsync(client);
                await tokenService.DeleteResetTokenAsync(request.Email);
                return Result<Unit>.Success(Unit.Value);
            }

            if (designer != null)
            {
                designer.PasswordHash = PasswordHasher.HashPassword(request.NewPassword);
                await repository1.UpdateAsync(designer);
                await tokenService.DeleteResetTokenAsync(request.Email);
                return Result<Unit>.Success(Unit.Value);
            }

            return Result<Unit>.Failure("Email not found in either Client or Designer repositories.");
        }

    }
}
