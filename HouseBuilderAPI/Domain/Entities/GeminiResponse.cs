namespace Domain.Entities
{
    public class GeminiResponse
    {
        public List<HouseSpecifications> Suggestions { get; set; }
        public string Explanation { get; set; }
    }
}
