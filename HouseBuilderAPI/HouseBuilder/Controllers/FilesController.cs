using Domain.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace HouseBuilder.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class FilesController : ControllerBase
    {
        private readonly IFileStorageService _fileStorageService;
        private readonly string _certificatesContainer;
        private readonly string _profileContainer;

        public FilesController(IFileStorageService fileStorageService, IConfiguration configuration)
        {
            _fileStorageService = fileStorageService;
            _certificatesContainer = configuration["AzureStorage:Container:Certificates"];
            _profileContainer = configuration["AzureStorage:Container:Profile"];

        }

        [HttpPost("upload-certificate")]
        public async Task<IActionResult> UploadCertificate(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("No file uploaded");

            try
            {
                var allowedExtensions = new[] { ".pdf", ".jpg", ".jpeg", ".png" };
                var extension = Path.GetExtension(file.FileName).ToLowerInvariant();

                if (!Array.Exists(allowedExtensions, e => e == extension))
                    return BadRequest("Invalid file type. Only PDF, JPG, JPEG, and PNG files are allowed.");

                var filePath = await _fileStorageService.SaveFileAsync(file, "certificates", _certificatesContainer);

                return Ok(new { filePath });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost("upload-profile")]
        public async Task<IActionResult> UploadProfile(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("No file uploaded");

            try
            {
                var allowedExtensions = new[] { ".jpg", ".jpeg", ".png" };
                var extension = Path.GetExtension(file.FileName).ToLowerInvariant();

                if (!Array.Exists(allowedExtensions, e => e == extension))
                    return BadRequest("Invalid file type. Only JPG, JPEG, and PNG files are allowed.");

                var filePath = await _fileStorageService.SaveFileAsync(file, "profile", _profileContainer);

                return Ok(new { filePath });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }



    }

}
