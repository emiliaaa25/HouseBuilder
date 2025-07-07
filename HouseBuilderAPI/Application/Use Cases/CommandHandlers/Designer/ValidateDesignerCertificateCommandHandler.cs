using Application.Use_Cases.Commands.Designer;
using Domain.Common;
using Domain.Repositories;
using MediatR;

namespace Application.Use_Cases.CommandHandlers.Designer
{
    public class ValidateDesignerCertificateCommandHandler : IRequestHandler<ValidateDesignerCertificateCommand, Result<bool>>
    {
        private readonly IDesignerRepository repository;
        private readonly IEmailService emailService;

        public ValidateDesignerCertificateCommandHandler(IDesignerRepository repository, IEmailService emailService)
        {
            this.repository = repository;
            this.emailService = emailService;
        }

        public async Task<Result<bool>> Handle(ValidateDesignerCertificateCommand request, CancellationToken cancellationToken)
        {
            var designer = await repository.GetByIdAsync(request.DesignerId);
            if (designer == null)
            {
                return Result<bool>.Failure("Designer not found");
            }

            designer.Status = request.NewStatus;
            designer.AdminNotes = request.AdminNotes;
            await repository.UpdateAsync(designer);
            string statusMessage = request.NewStatus == VerificationStatus.Approved ? "approved" : "rejected";
            string statusColor = request.NewStatus == VerificationStatus.Approved ? "#4CAF50" : "#F44336";

            var emailTemplate = @"
<!DOCTYPE html>
<html>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>Designer Profile Update</title>
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
        .status {{
            font-weight: bold;
            color: {0};
            font-size: 18px;
            margin: 15px 0;
        }}
        .notes {{
            background-color: #f5f5f5;
            padding: 15px;
            border-left: 4px solid #4285f4;
            margin: 15px 0;
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
            <h2>Designer Profile Update</h2>
        </div>
        <div class='content'>
            <p>Hello {1},</p>
            <p>We would like to inform you that your designer profile has been reviewed by our team.</p>
            <p class='status'>Your profile has been <strong>{2}</strong>.</p>
            
            <div class='notes'>
                <p><strong>Admin Notes:</strong></p>
                <p>{3}</p>
            </div>
            
            <p>If you have any questions regarding this decision, please don't hesitate to contact our support team.</p>
            <p>Thank you for your interest in our platform.</p>
            <p>Best regards,<br>HouseBuilder Team</p>
        </div>
        <div class='footer'>
            <p>This is an automated email. Please do not reply to this message.</p>
        </div>
    </div>
</body>
</html>";

            var emailBody = string.Format(emailTemplate,
                statusColor,                
                designer.FirstName,        
                statusMessage,             
                request.AdminNotes    
            );

            await emailService.SendEmailAsync(
                to: designer.Email,
                subject: "Designer Profile Status Update",
                body: emailBody
            );

            return Result<bool>.Success(true);
        }
    }
}