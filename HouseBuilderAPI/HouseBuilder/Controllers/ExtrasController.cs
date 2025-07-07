using Application.DTOs;
using Application.Use_Cases.Commands;
using Application.Use_Cases.Commands.Extras;
using Application.Use_Cases.Commands.HouseSpecifications;
using Application.Use_Cases.Queries;
using Application.Use_Cases.Queries.Extras;
using Application.Use_Cases.Queries.HouseSpecifications;
using Application.Use_Cases.ResetPassword;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HouseBuilder.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class ExtrasController : ControllerBase
    {
        private readonly IMediator mediator;

        public ExtrasController(IMediator mediator)
        {
            this.mediator = mediator;
        }
        [HttpPost]
        public async Task<IActionResult> CreateExtras(CreateExtrasCommand command)
        {

            try
            {
                var result = await mediator.Send(command);
                return CreatedAtAction(nameof(GetByID), new { Id = result.Data }, result.Data);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }



        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateExtras(Guid id, UpdateExtrasCommand command)
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
        public async Task<IActionResult> DeleteExtras(Guid id)
        {

            try
            {
                var result = await mediator.Send(new DeleteExtrasCommand(id));
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

        [HttpGet("specs/{houseSpecificationsId}")]
        public async Task<ActionResult<List<ExtrasDto>>> GetAllExtras(Guid houseSpecificationsId)
        {
            try
            {
                return await mediator.Send(new GetAllExtrasQuery(houseSpecificationsId));
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpGet("extra/{id}/specs/{houseSpecificationsId}")]
        public async Task<IActionResult> GetByID(Guid id, Guid houseSpecificationsId)
        {
            try
            {
                var query = new GetHouseSpecificationsByIdQuery(id, houseSpecificationsId);
                var result = await mediator.Send(query);
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

    }
}
