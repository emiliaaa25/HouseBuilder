using System.Reflection;
using Application.DTOs;
using Application.Use_Cases.Commands;
using Application.Use_Cases.Commands.Project;
using Application.Use_Cases.Queries.Project;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace HouseBuilder.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class ProjectController : ControllerBase
    {
        private readonly IMediator mediator;
        public ProjectController(IMediator mediator)
        {
            this.mediator = mediator;
        }
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CreateProject(CreateProjectCommand command)
        {

            try
            {
                var id = await mediator.Send(command);
                return CreatedAtAction(
                    nameof(GetByID), 
                    new { Id = id, clientId = command.ConstructorId },
                    new { id });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProject(Guid id, UpdateProjectCommand command)
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
        public async Task<IActionResult> DeleteProject(Guid id)
        {

            try
            {
                var result = await mediator.Send(new DeleteProjectCommand(id));
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

        [HttpGet("client/{clientid}")]
        public async Task<ActionResult<List<ProjectDto>>> GetAllProjects(Guid clientid)
        {
            try
            {
                return await mediator.Send(new GetAllProjectsQuery(clientid));
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpGet("project/{id}/client/{clientId}")]
        public async Task<IActionResult> GetByID(Guid id, Guid clientId)
        {
            try
            {
                var query = new GetProjectByIdQuery(id, clientId);
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

