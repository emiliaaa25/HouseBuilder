using Application.DTOs;
using Application.Use_Cases.Queries.Designer;
using AutoMapper;
using Domain.Common;
using Domain.Repositories;
using MediatR;

namespace Application.Use_Cases.QueryHandlers.Designer
{
    public class GetDesignerByIdQueryHandler : IRequestHandler<GetDesignerByIdQuery, Result<DesignerDto>>
    {
        private readonly IDesignerRepository repository;
        private readonly IMapper mapper;

        public GetDesignerByIdQueryHandler(IDesignerRepository repository, IMapper mapper)
        {
            this.repository = repository;
            this.mapper = mapper;
        }

        public async Task<Result<DesignerDto>> Handle(GetDesignerByIdQuery request, CancellationToken cancellationToken)
        {
            var designer = await repository.GetByIdAsync(request.Id);
            if (designer is null)
            {
                return Result<DesignerDto>.Failure("Designer not found");
            }
            return Result<DesignerDto>.Success(mapper.Map<DesignerDto>(designer));
        }
    }

}
