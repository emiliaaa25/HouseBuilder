namespace Domain.Entities
{
    public class Door
    {
        public Guid Id { get; set; }
        public string Wall { get; set; }
        public double Position { get; set; } 

        public string Path { get; set; }

        public string Thumbnail { get; set; }

        public Scale Scale { get; set; }
    }
}
