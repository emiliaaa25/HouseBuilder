using Application.DTOs;
using Application.Queries.AdminQueries;
using AutoMapper;
using Domain.Repositories;
using MediatR;

namespace Application.QueryHandlers.AdminQueryHandlers
{
    public class GetAllAdminsQueryHandler : IRequestHandler<GetAllAdminsQuery, List<AdminDto>>
    {
        private readonly IAdminRepository adminRepository;
        private readonly IMapper mapper;

        public GetAllAdminsQueryHandler(IAdminRepository adminRepository, IMapper mapper)
        {
            this.adminRepository = adminRepository;
            this.mapper = mapper;
        }

        public async Task<List<AdminDto>> Handle(GetAllAdminsQuery request, CancellationToken cancellationToken)
        {
            var admins = await adminRepository.GetAllAsync();
            return mapper.Map<List<AdminDto>>(admins);
        }
    }

}
