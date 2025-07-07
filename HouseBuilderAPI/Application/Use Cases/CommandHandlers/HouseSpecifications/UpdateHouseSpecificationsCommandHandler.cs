using Application.Use_Cases.Commands.HouseSpecifications;
using AutoMapper;
using Domain.Common;
using Domain.Repositories;
using MediatR;
using NuGet.Protocol.Plugins;

namespace Application.Use_Cases.CommandHandlers.HouseSpecifications
{
    public class UpdateHouseSpecificationsCommandHandler : IRequestHandler<UpdateHouseSpecificationsCommand, Result<Unit>>
    {
        private readonly IHouseSpecificationsRepository houseSpecificationsRepository;
        private readonly IMapper mapper;
        public UpdateHouseSpecificationsCommandHandler(IHouseSpecificationsRepository houseSpecificationsRepository, IMapper mapper)
        {
            this.houseSpecificationsRepository = houseSpecificationsRepository;
            this.mapper = mapper;
        }
        public async Task<Result<Unit>> Handle(UpdateHouseSpecificationsCommand request, CancellationToken cancellationToken)
        {
            var houseSpecification = await houseSpecificationsRepository.GetByIdAsync(p => p.Id == request.Id);
            if (houseSpecification == null)
            {
                return Result<Unit>.Failure("House specification not found");
            }
            var updatedHouseSpecification = mapper.Map(request, houseSpecification);
            await houseSpecificationsRepository.UpdateAsync(updatedHouseSpecification);
            return Result<Unit>.Success(Unit.Value);
        }
    }
   
}
