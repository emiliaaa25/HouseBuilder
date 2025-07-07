using Application.Queries;
using Domain.Repositories;
using MediatR;

namespace Application.QueryHandlers
{
    public class CheckEmailQueryHandler : IRequestHandler<CheckEmailQuery, bool>
    {
        private readonly IClientRepository repository;
        private readonly IDesignerRepository designerRepository;
        public CheckEmailQueryHandler(IClientRepository clientRepository, IDesignerRepository designerRepository)
        {
            this.repository = clientRepository;
            this.designerRepository = designerRepository;

        }
        public async Task<bool> Handle(CheckEmailQuery request, CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(request.Email))
            {
                throw new ArgumentException("Email cannot be empty.");
            }
            var clientExists = await repository.GetByEmailAsync(request.Email);
            if (clientExists != null)
            {
                return true;
            }
            var designerExists = await designerRepository.GetByEmailAsync(request.Email);
            if (designerExists != null)
            {
                return true;
            }
            return false;
        }
    }
}
