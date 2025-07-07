using Application.DTOs;
using Application.Use_Cases.Queries.Designer;
using AutoMapper;
using Domain.Repositories;
using MediatR;

namespace Application.Use_Cases.QueryHandlers.Designer
{
    public class GetPendingCertificatesQueryHandler : IRequestHandler<GetPendingCertificatesQuery, List<DesignerDto>>
    {
        private readonly IDesignerRepository repository;
        private readonly IMapper mapper;

        public GetPendingCertificatesQueryHandler(IDesignerRepository repository, IMapper mapper)
        {
            this.repository = repository;
            this.mapper = mapper;
        }

        public async Task<List<DesignerDto>> Handle(GetPendingCertificatesQuery request, CancellationToken cancellationToken)
        {
            var designers = await repository.GetDesignersByVerificationStatus(request.StatusFilter);

            return mapper.Map<List<DesignerDto>>(designers);
        }
    }
}