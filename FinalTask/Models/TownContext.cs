using System.Data.Entity;

namespace FinalTask.Models
{
    public class TownContext : DbContext
    {
        public DbSet<Town> Towns { get; set; }
    }
}