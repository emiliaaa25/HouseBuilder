using Application.DTOs;
using MediatR;

namespace Application.Use_Cases.Queries.Designer
{
    public class GetAllDesignersQuery : IRequest<List<DesignerDto>>
    {
    }
}
