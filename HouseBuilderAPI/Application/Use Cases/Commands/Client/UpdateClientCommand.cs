using MediatR;

namespace Application.Use_Cases.Commands
{
    public class UpdateClientCommand : UserCommand<Unit>
    {
        public Guid Id { get; set; }
    }
}
