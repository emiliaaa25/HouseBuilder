using Application.DTOs;
using Application.Use_Cases.Commands.PublicProject;
using Application.Use_Cases.Queries.PublicProject;
using Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace HouseBuilder.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class PublicProjectController : ControllerBase
    {
        private readonly IMediator mediator;

        public PublicProjectController(IMediator mediator)
        {
            this.mediator = mediator;
        }

       
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<List<PublicProjectDto>>> GetPublicProjects(
            [FromQuery] Guid? userId = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 12,
            [FromQuery] string sortBy = "newest")
        {
            try
            {
                var query = new GetPublicProjectsQuery
                {
                    CurrentUserId = userId,
                    Page = page,
                    PageSize = pageSize,
                    SortBy = sortBy
                };

                var result = await mediator.Send(query);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

       
        [HttpGet("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<PublicProjectDto>> GetPublicProject(
            Guid id,
            [FromQuery] Guid? userId = null)
        {
            try
            {
                var clientIp = HttpContext.Connection.RemoteIpAddress?.ToString();

                var query = new GetPublicProjectByIdQuery
                {
                    Id = id,
                    CurrentUserId = userId,
                    IpAddress = clientIp
                };

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

        
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CreatePublicProject([FromBody] CreatePublicProjectDto dto)
        {
            try
            {
                var command = new CreatePublicProjectCommand
                {
                    ProjectId = dto.ProjectId,
                    Thumbnail = dto.Thumbnail,
                    Title = dto.Title,
                    Description = dto.Description,
                    AuthorName = dto.AuthorName
                };

                var result = await mediator.Send(command);

                if (result.IsSuccess)
                {
                    return CreatedAtAction(
                        nameof(GetPublicProject),
                        new { id = result.Data },
                        new { id = result.Data });
                }

                return BadRequest(result.ErrorMessage);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

       
        [HttpPost("{id}/like")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> ToggleLike(Guid id, [FromBody] ToggleLikeRequest request)
        {
            try
            {
                var command = new ToggleLikeCommand
                {
                    PublicProjectId = id,
                    UserId = request.UserId
                };

                var result = await mediator.Send(command);

                if (result.IsSuccess)
                {
                    return Ok(new { isLiked = result.Data });
                }

                return BadRequest(result.ErrorMessage);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        
        [HttpDelete("project/{projectId}/user/{userId}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> DeletePublicProject(Guid projectId, Guid userId)
        {
            try
            {
                var command = new DeletePublicProjectCommand
                {
                    ProjectId = projectId,
                    UserId = userId
                };

                var result = await mediator.Send(command);

                if (result.IsSuccess)
                {
                    return NoContent();
                }

                return BadRequest(result.ErrorMessage);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }


        
        [HttpGet("check/{projectId}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<bool>> IsProjectPublic(Guid projectId)
        {
            try
            {
                var query = new CheckProjectIsPublicQuery
                {
                    ProjectId = projectId
                };

                var result = await mediator.Send(query);

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
    }
}
