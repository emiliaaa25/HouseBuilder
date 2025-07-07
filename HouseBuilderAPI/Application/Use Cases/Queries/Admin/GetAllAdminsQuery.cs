using Application.DTOs;
using MediatR;

namespace Application.Queries.AdminQueries
{
    public class GetAllAdminsQuery : IRequest<List<AdminDto>>
    {
    }
}
