using Application.Commands.Administrator;
using Application.DTOs;
using Application.Queries.AdminQueries;
using Application.Use_Cases.Authentification;
using Application.Use_Cases.Commands.Designer;
using Application.Use_Cases.Queries.Designer;
using Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Components.Forms;
using Microsoft.AspNetCore.Mvc;

namespace HouseBuilder.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class AdminController : ControllerBase
    {
        private readonly IMediator mediator;

        public AdminController(IMediator mediator)
        {
            this.mediator = mediator;
        }

        [HttpGet("designer-certificates")]
        [Authorize(Roles = "Admin")] 
        public async Task<ActionResult<List<DesignerDto>>> GetDesignerCertificates([FromQuery] VerificationStatus? status = null)
        {
            try
            {
                var certificates = await mediator.Send(new GetPendingCertificatesQuery { StatusFilter = status });
                return Ok(certificates);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("validate-certificate/{id}")]
        [Authorize(Roles = "Admin")] 
        public async Task<IActionResult> ValidateCertificate(Guid id, [FromBody] ValidateDesignerCertificateCommand command)
        {
            if (id != command.DesignerId)
            {
                return BadRequest("ID-urile nu corespund");
            }

            try
            {
                var result = await mediator.Send(command);
                if (result.IsSuccess)
                {
                    return Ok(result.Data);
                }
                return BadRequest(result.ErrorMessage);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpPost("login")]
        public async Task<ActionResult<LoginResponse>> LoginAdmin(LoginUserCommand command)
        {
            try
            {
                var response = await mediator.Send(command);
                return Ok(response);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ex.Message);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpGet]
        public async Task<ActionResult<IEnumerable<AdminDto>>> GetAll()
        {
            try
            {
                var admins = await mediator.Send(new GetAllAdminsQuery());
                return Ok(admins);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetByID(Guid id)
        {
            try
            {
                var result = await mediator.Send(new GetAdminByIdQuery { Id = id });
                if (result.IsSuccess)
                {
                    return Ok(result.Data);
                }
                return NotFound(result.ErrorMessage);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("{id:guid}")]
        [Authorize]
        public async Task<IActionResult> Update(Guid id, UpdateAdminCommand command)
        {

            if (id != command.Id)
            {
                return BadRequest();
            }

            try
            {
                var result = await mediator.Send(command);
                if (result.IsSuccess)
                {
                    return NoContent();
                }
                return NotFound(result.ErrorMessage);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> Delete(Guid id)
        {
            

            try
            {
                var result = await mediator.Send(new DeleteAdminByIdCommand(id));
                if (result.IsSuccess)
                {
                    return NoContent();
                }
                return NotFound(result.ErrorMessage);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
