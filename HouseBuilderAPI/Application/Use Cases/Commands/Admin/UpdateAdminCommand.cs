using Application.Use_Cases.Commands;
using MediatR;

namespace Application.Commands.Administrator
{
    public class UpdateAdminCommand: UserCommand<Unit>
    {
        public Guid Id { get; set; }
    }
}
