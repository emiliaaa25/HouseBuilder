using Domain.Entities.Shapes;
using Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using System.Text;
using System.Text.Json;

namespace API.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class GeminiController : ControllerBase
    {
        private readonly HttpClient _httpClient;
        private readonly string _geminiApiKey;
        private readonly string _geminiApiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

        public GeminiController(IHttpClientFactory httpClientFactory, IConfiguration configuration)
        {
            _httpClient = httpClientFactory.CreateClient();
            _geminiApiKey = configuration["GeminiApi:ApiKey"];
        }

        [HttpPost("generateExteriorDesign")]
        public async Task<IActionResult> GenerateExteriorDesign([FromBody] ExteriorDesignRequest request)
        {
            if (string.IsNullOrEmpty(request?.LandSize) || string.IsNullOrEmpty(request?.HouseShape))
            {
                return BadRequest(new { error = "Land size and house shape are required" });
            }

            try
            {
                string prompt = BuildExteriorDesignPrompt(request);

                var requestData = new
                {
                    contents = new[]
                    {
                new { parts = new[] { new { text = prompt } } }
            }
                };

                string requestJson = JsonSerializer.Serialize(requestData);
                var content = new StringContent(requestJson, Encoding.UTF8, "application/json");
                string apiUrl = $"{_geminiApiUrl}?key={_geminiApiKey}";

                var response = await _httpClient.PostAsync(apiUrl, content);
                response.EnsureSuccessStatusCode();

                var responseJson = await response.Content.ReadAsStringAsync();
                using var responseDoc = JsonDocument.Parse(responseJson);
                var responseText = responseDoc.RootElement
                    .GetProperty("candidates")[0]
                    .GetProperty("content")
                    .GetProperty("parts")[0]
                    .GetProperty("text")
                    .GetString();

                return Ok(new { response = responseText });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Error generating exterior design", message = ex.Message });
            }
        }

        private string BuildExteriorDesignPrompt(ExteriorDesignRequest request)
        {
            StringBuilder promptBuilder = new StringBuilder();

            promptBuilder.AppendLine("You are an architect specialized in exterior house design. The client wants suggestions for the exterior appearance of a house, focusing on structure, proportions, windows, doors, and exterior materials.");
            promptBuilder.AppendLine();

            promptBuilder.AppendLine("CLIENT SPECIFICATIONS:");
            promptBuilder.AppendLine($"- Land size: {request.LandSize} ares");
            promptBuilder.AppendLine($"- House shape: {request.HouseShape}");
            promptBuilder.AppendLine($"- Budget: {request.Budget}");
            promptBuilder.AppendLine($"- Family: {request.FamilySize} members");

            if (!string.IsNullOrEmpty(request.AdditionalRequirements))
            {
                promptBuilder.AppendLine($"- Additional requirements: {request.AdditionalRequirements}");
            }

            promptBuilder.AppendLine();
            promptBuilder.AppendLine("Generate EXACTLY 3 exterior design suggestions for this house. FOCUS ONLY ON THE EXTERIOR ASPECT - do not provide details about interior spaces, furniture, installations, or interior design.");

            promptBuilder.AppendLine();
            promptBuilder.AppendLine("IMPORTANT: Format your response EXACTLY as follows:");
            promptBuilder.AppendLine();
            promptBuilder.AppendLine("Brief introduction paragraph...");
            promptBuilder.AppendLine();
            promptBuilder.AppendLine("1. [Design Concept Name]");
            promptBuilder.AppendLine("- Recommended general dimensions for the house (length, width)");
            promptBuilder.AppendLine("- Number of floors and height for each floor");
            promptBuilder.AppendLine("- Main exterior materials (facade, roof)");
            promptBuilder.AppendLine("- Roof type (flat, gable, or hip in general)");
            promptBuilder.AppendLine("- Recommended positions and dimensions for windows and doors");
            promptBuilder.AppendLine("- Exterior colors and finishes (for walls, roof, and floor where applicable - texture + color for that texture)");
            promptBuilder.AppendLine("- A distinctive or decorative architectural element");
            promptBuilder.AppendLine();
            promptBuilder.AppendLine("2. [Design Concept Name]");
            promptBuilder.AppendLine("[Same structure as above]");
            promptBuilder.AppendLine();
            promptBuilder.AppendLine("3. [Design Concept Name]");
            promptBuilder.AppendLine("[Same structure as above]");

            if (request.HouseShape.ToLower().Contains("l"))
            {
                promptBuilder.AppendLine();
                promptBuilder.AppendLine("For an L-shaped house, include in each design:");
                promptBuilder.AppendLine("- Recommended dimensions for each arm of the L shape");
                promptBuilder.AppendLine("- Optimal positions for main windows to maximize natural light");
                promptBuilder.AppendLine("- Suggestions for treating the corner (e.g., terrace, special facade)");
            }
            else if (request.HouseShape.ToLower().Contains("t"))
            {
                promptBuilder.AppendLine();
                promptBuilder.AppendLine("For a T-shaped house, include in each design:");
                promptBuilder.AppendLine("- Recommended dimensions for each segment");
                promptBuilder.AppendLine("- Treatment of intersection areas");
            }
            else if (request.HouseShape.ToLower().Contains("u"))
            {
                promptBuilder.AppendLine();
                promptBuilder.AppendLine("For a U-shaped house, include in each design:");
                promptBuilder.AppendLine("- Recommended dimensions for each arm");
                promptBuilder.AppendLine("- Suggestions for utilizing the interior courtyard");
            }

            promptBuilder.AppendLine();
            promptBuilder.AppendLine("CRITICAL: Each suggestion must be practical, feasible, and fit within the specified budget. Use the EXACT numbering format (1., 2., 3.) and clear section breaks. Do not mention interior design aspects, detailed interior compartmentalization, or installations. Focus exclusively on shape, proportions, materials, and exterior appearance of the house.");
            promptBuilder.AppendLine();
            promptBuilder.AppendLine("Please respond in English with clear numbered sections as specified above.");

            return promptBuilder.ToString();
        }
    }

        public class ExteriorDesignRequest
    {
        public string LandSize { get; set; }       
        public string HouseShape { get; set; }      
        public string Budget { get; set; }          
        public string FamilySize { get; set; }     
        public string AdditionalRequirements { get; set; } 
    }
}