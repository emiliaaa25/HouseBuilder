using Application.DTOs;
using Application.Use_Cases.Commands.HouseSpecifications;
using Application.Use_Cases.Queries.HouseSpecifications;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace HouseBuilder.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class HouseSpecificationsController : ControllerBase
    {
        private readonly IMediator mediator;
        public HouseSpecificationsController(IMediator mediator)
        {
            this.mediator = mediator;
        }
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CreateHouseSpecifications(CreateHouseSpecificationsCommand command)
        {

            try
            {
                var result = await mediator.Send(command);
                return CreatedAtAction(nameof(GetByID), new { Id = result.Data, projectId = command.ProjectId }, 
                    new { result.Data });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateHouseSpecifications(Guid id, UpdateHouseSpecificationsCommand command)
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
        public async Task<IActionResult> DeleteHouseSpecifications(Guid id)
        {

            try
            {
                var result = await mediator.Send(new DeleteHouseSpecificationsCommand(id));
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

        [HttpGet("project/{projectId}")]
        public async Task<ActionResult<List<HouseSpecificationsDto>>> GetAllHouseSpecifications(Guid projectId)
        {
            try
            {
                return await mediator.Send(new GetAllHouseSpecificationsQuery(projectId));
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpGet("specs/{id}/project/{projectId}")]
        public async Task<IActionResult> GetByID(Guid id, Guid projectId)
        {
            try
            {
                var query = new GetHouseSpecificationsByIdQuery(id, projectId);
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
        [HttpGet("{shapeType}")]
        public IActionResult GetParametersForShapeType(HouseShapeType shapeType)
        {
            var parameters = shapeType switch
            {
                HouseShapeType.Rectangular => new
                {
                    type = "Rectangular",
                    fields = new[]
                    {
                        new { name = "Length", type = "float", required = true, description = "Lungimea casei" },
                        new { name = "Width", type = "float", required = true, description = "Lățimea casei" }
                    }
                },
                HouseShapeType.Square => new
                {
                    type = "Square",
                    fields = new[]
                    {
                        new { name = "Size", type = "float", required = true, description = "Dimensiunea laturii casei" }
                    }
                },
                HouseShapeType.LShape => new
                {
                    type = "L-Shape",
                    fields = new[]
                    {
                        new { name = "MainLength", type = "float", required = true, description = "Lungimea segmentului principal" },
                        new { name = "MainWidth", type = "float", required = true, description = "Lățimea segmentului principal" },
                        new { name = "ExtensionLength", type = "float", required = true, description = "Lungimea extensiei" },
                        new { name = "ExtensionWidth", type = "float", required = true, description = "Lățimea extensiei" }
                    }
                },
                HouseShapeType.TShape => new
                {
                    type = "T-Shape",
                    fields = new[]
                    {
                        new { name = "MainLength", type = "float", required = true, description = "Lungimea segmentului principal" },
                        new { name = "MainWidth", type = "float", required = true, description = "Lățimea segmentului principal" },
                        new { name = "CrossLength", type = "float", required = true, description = "Lungimea barului transversal" },
                        new { name = "CrossWidth", type = "float", required = true, description = "Lățimea barului transversal" }
                    }
                },
                HouseShapeType.UShape => new
                {
                    type = "U-Shape",
                    fields = new[]
                    {
                        new { name = "BaseLength", type = "float", required = true, description = "Lungimea bazei U-ului" },
                        new { name = "BaseWidth", type = "float", required = true, description = "Lățimea bazei U-ului" },
                        new { name = "LeftWingLength", type = "float", required = true, description = "Lungimea aripii stângi" },
                        new { name = "LeftWingWidth", type = "float", required = true, description = "Lățimea aripii stângi" },
                        new { name = "RightWingLength", type = "float", required = true, description = "Lungimea aripii drepte" },
                        new { name = "RightWingWidth", type = "float", required = true, description = "Lățimea aripii drepte" }
                    }
                },
                _ => throw new ArgumentException($"Shape type {shapeType} is not supported")
            };

            return Ok(parameters);
        }

        [HttpGet]
        public IActionResult GetAllShapeParameters()
        {
            var allParameters = Enum.GetValues(typeof(HouseShapeType))
                .Cast<HouseShapeType>()
                .Select(type =>
                {
                    var result = this.GetParametersForShapeType(type) as OkObjectResult;
                    return result?.Value;
                })
                .ToList();

            return Ok(allParameters);
        }
    }
}

