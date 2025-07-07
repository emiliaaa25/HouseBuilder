using System.Net;
using System.Net.Mail;
using System.Text;
using Domain.Repositories;
using MailKit.Security;
using MimeKit;

namespace Infrastructure
{
    public class EmailService : IEmailService
    {
        private readonly string smtpServer = "smtp.gmail.com";
        private readonly int smtpPort = 587;
        private readonly bool enableSsl = true;
        private readonly string senderEmail = "housebuilder691@gmail.com";
        private readonly string senderPassword = "fwvq zvlp nkoe jrtl";

        public async Task SendEmailAsync(string email, string subject, string message)
        {
            var client = new SmtpClient(smtpServer, smtpPort)
            {
                EnableSsl = enableSsl,
                Credentials = new NetworkCredential(senderEmail, senderPassword)
            };

            var mailMessage = new MailMessage(senderEmail, email, subject, message)
            {
                BodyEncoding = Encoding.UTF8,
                SubjectEncoding = Encoding.UTF8,
                IsBodyHtml = true

            };

            await client.SendMailAsync(mailMessage);
        }
    }
}
