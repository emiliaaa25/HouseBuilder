using Application.DTOs;
using Domain.Common;
using MediatR;

namespace Application.Use_Cases.Queries
{
    public class GetClientByIdQuery : IRequest<Result<ClientDto>>
    {
        public Guid Id { get; set; }
    }
}
