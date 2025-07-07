using Application.DTOs;
using Application.Use_Cases.Authentification;
using Application.Use_Cases.Commands;
using Application.Use_Cases.Queries;
using Application.Use_Cases.ResetPassword;
using Domain.Entities;
using Infrastructure.Services;
using Infrastructure;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Authorization.Infrastructure;
using Microsoft.AspNetCore.Mvc;
using Domain.Repositories;
using Domain.Services;
using Microsoft.EntityFrameworkCore;
using Application.Queries;

namespace HouseBuilder.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class ClientController : ControllerBase
    {
        private readonly IMediator mediator;
        private readonly IEmailService emailService;
        private readonly IValidationTokenService validationTokenService;
        public ClientController(IMediator mediator, IEmailService emailService, IValidationTokenService validationTokenService)
        {
            this.mediator = mediator;
            this.emailService = emailService;
            this.validationTokenService = validationTokenService;
        }
        [HttpPost]
        public async Task<IActionResult> CreateClient(CreateClientCommand command)
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
        [Authorize]
        public async Task<IActionResult> UpdateClient(Guid id, UpdateClientCommand command)
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
        public async Task<IActionResult> DeleteClient(Guid id)
        {

            try
            {
                var result = await mediator.Send(new DeleteClientCommand(id));
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
        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword(ResetPasswordCommand command)
        {
            try
            {
                var result = await mediator.Send(command);
                if (result.IsSuccess)
                {
                    return Ok(new { success = true, message = "Password reset successfully" });
                }
                return BadRequest(new { success = false, message = result.ErrorMessage });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpGet]
        public async Task<ActionResult<List<ClientDto>>> GetAllClients()
        {
            try
            {
                return await mediator.Send(new GetAllClientsQuery());
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("login")]
        public async Task<ActionResult<LoginResponse>> LoginClient(LoginUserCommand command)
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
        [HttpGet("{id}")]
        public async Task<IActionResult> GetByID(Guid id)
        {
            try
            {
                var result = await mediator.Send(new GetClientByIdQuery { Id = id });
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
        [HttpPut("{id:guid}/update-password")]
        [Authorize]
        public async Task<IActionResult> UpdatePassword(Guid id, UpdateClientPasswordCommand command)
        {


            if (id != command.ClientId)
            {
                return BadRequest("The id should be identical with command.Id");
            }

            try
            {
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
        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromQuery] string email)
        {
            if (string.IsNullOrEmpty(email))
            {
                return BadRequest(new { success = false, message = "Email is required" });
            }

            try
            {
                var token = await validationTokenService.GenerateResetTokenAsync(email);
                var resetLink = $"http://localhost:4200/reset-password/{token}";

                var emailTemplate = @"
<!DOCTYPE html>
<html>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>Password Reset</title>
    <style>
        body {{
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333333;
            max-width: 600px;
            margin: 0 auto;
        }}
        .container {{
            padding: 20px;
            background-color: #f9f9f9;
            border-radius: 5px;
        }}
        .header {{
            text-align: center;
            padding: 10px;
            background-color: #4285f4;
            color: white;
            border-radius: 5px 5px 0 0;
        }}
        .content {{
            padding: 20px;
            background-color: white;
            border: 1px solid #dedede;
        }}
        .button {{
            display: inline-block;
            padding: 10px 20px;
            margin: 20px 0;
            background-color: #4285f4;
            color: white;
            text-decoration: none;
            border-radius: 4px;
            text-align: center;
        }}
        .footer {{
            font-size: 12px;
            text-align: center;
            margin-top: 20px;
            color: #777777;
        }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h2>Password Reset</h2>
        </div>
        <div class='content'>
            <p>Hello,</p>
            <p>We received a request to reset your account password. To reset your password, please click the button below:</p>
            <div style='text-align: center;'>
                <a href='{0}' class='button'>Reset Password</a>
            </div>
            <p>Or you can copy and paste the following link into your browser:</p>
            <p>{0}</p>
            <p>If you didn't request a password reset, you can ignore this email.</p>
            <p>This link will expire in 24 hours for security reasons.</p>
            <p>Best regards,<br>Our Team</p>
        </div>
        <div class='footer'>
            <p>This is an automated email. Please do not reply to this message.</p>
        </div>
    </div>
</body>
</html>";

                var emailBody = string.Format(emailTemplate, resetLink);

                await emailService.SendEmailAsync(email, "Password Reset", emailBody);

                return Ok(new { success = true, message = "A password reset link has been sent to your email address." });
            }
            catch (DbUpdateException dbEx)
            {
                return BadRequest(new { success = false, message = "An error occurred while saving the entity changes.", details = dbEx.InnerException?.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }
        [HttpGet("check-email")]
        public async Task<IActionResult> CheckEmail(string email)
        {
            try
            {
                var exists = await mediator.Send(new CheckEmailQuery { Email = email });
                return Ok(new { exists });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }

}
