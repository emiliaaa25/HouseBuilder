using Application.Use_Cases.Commands.Designer;
using AutoMapper;
using Domain.Common;
using Domain.Repositories;
using Domain.Services;
using MediatR;
using Domain.Entities;

namespace Application.Use_Cases.CommandHandlers.Designer
{
    public class CreateDesignerCommandHandler : IRequestHandler<CreateDesignerCommand, Result<Guid>>
    {
        private readonly IDesignerRepository repository;
        private readonly IMapper mapper;

        public CreateDesignerCommandHandler(IDesignerRepository repository, IMapper mapper)
        {
            this.repository = repository;
            this.mapper = mapper;
        }
        public async Task<Result<Guid>> Handle(CreateDesignerCommand request, CancellationToken cancellationToken)
        {
            var designer = mapper.Map<Domain.Entities.Designer>(request);
            designer.PasswordHash = PasswordHasher.HashPassword(request.PasswordHash);

            var result = await repository.AddAsync(designer);
            if (result.IsSuccess)
            {
                return Result<Guid>.Success(result.Data);
            }
            return Result<Guid>.Failure(result.ErrorMessage);
        }
    }
}