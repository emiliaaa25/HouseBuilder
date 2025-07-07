using Application.Use_Cases.Commands.HouseSpecifications;
using AutoMapper;
using Domain.Common;
using Domain.Repositories;
using MediatR;

namespace Application.Use_Cases.CommandHandlers.HouseSpecifications
{
    public class DeleteHouseSpecificationsCommandHandler : IRequestHandler<DeleteHouseSpecificationsCommand, Result<Unit>>
    {
        private readonly IHouseSpecificationsRepository repository;
        private readonly IMapper mapper;
        public DeleteHouseSpecificationsCommandHandler(IHouseSpecificationsRepository repository, IMapper mapper)
        {
            this.repository = repository;
            this.mapper = mapper;
        }
        public async Task<Result<Unit>> Handle(DeleteHouseSpecificationsCommand request, CancellationToken cancellationToken)
        {
            var houseSpecification = await repository.GetByIdAsync(p => p.Id == request.Id);
            if (houseSpecification == null)
            {
                return Result<Unit>.Failure("House Specification not found");
            }
            await repository.DeleteAsync(houseSpecification.Id);
            return Result<Unit>.Success(Unit.Value);
        }
    }
}
