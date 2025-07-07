using Application.DTOs;
using Application.Queries.AdminQueries;
using AutoMapper;
using Domain.Common;
using Domain.Repositories;
using MediatR;

namespace Application.QueryHandlers.AdminQueryHandlers
{
    public class GetAdminByIdQueryHandler : IRequestHandler<GetAdminByIdQuery, Result<AdminDto>>
    {
        private readonly IAdminRepository adminRepository;
        private readonly IMapper mapper;

        public GetAdminByIdQueryHandler(IAdminRepository adminRepository, IMapper mapper)
        {
            this.adminRepository = adminRepository;
            this.mapper = mapper;
        }

        public async Task<Result<AdminDto>> Handle(GetAdminByIdQuery request, CancellationToken cancellationToken)
        {
            var admin = await adminRepository.GetByIdAsync(request.Id);
            if (admin == null)
            {
                return Result<AdminDto>.Failure("Admin not found");
            }
            return Result<AdminDto>.Success(mapper.Map<AdminDto>(admin));
        }
    }
}
