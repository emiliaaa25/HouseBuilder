using Domain.Entities;
using Domain.Repositories;
using MediatR;

namespace Application.Use_Cases.Authentification
{
    public class LoginUserCommandHandler : IRequestHandler<LoginUserCommand, LoginResponse>
    {
        private readonly IClientRepository clientRepository;
        private readonly IDesignerRepository designerRepository;
        private readonly IAdminRepository adminRepository;

        public LoginUserCommandHandler(IClientRepository clientRepository, IDesignerRepository designerRepository, IAdminRepository adminRepository)
        {
            this.clientRepository = clientRepository;
            this.designerRepository = designerRepository;
            this.adminRepository = adminRepository;
        }

        public async Task<LoginResponse> Handle(LoginUserCommand request, CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
            {
                throw new ArgumentException("Email or Password cannot be empty.");
            }

            var token = await clientRepository.Login(request.Email, request.Password);
            if (token != null)
            {
                return token!;
            }

            token = await designerRepository.Login(request.Email, request.Password);
            if (token != null)
            {
                return token!;
            }

            token = await adminRepository.Login(request.Email, request.Password);
            if (token != null)
            {
                return token!;
            }

            throw new UnauthorizedAccessException("Invalid credentials");

        }
    }
}
