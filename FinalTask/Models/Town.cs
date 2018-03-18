namespace FinalTask.Models
{
    public class Town
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public double CoordLat { get; set; }
        public double CoordLng { get; set; }
        public string WikiInfo { get; set; }
        public string WikiImage { get; set; }
        public bool Visited { get; set; }
    }
}