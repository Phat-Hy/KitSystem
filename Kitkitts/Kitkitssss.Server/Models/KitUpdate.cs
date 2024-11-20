using System.ComponentModel.DataAnnotations;

namespace Kitkitssss.Server.Models
{
    public class KitUpdate
    {
        [Required]
        public int KitId { get; set; }

        [Required]
        [StringLength(100)]
        public string? KitName { get; set; }

        public byte[]? KitImage { get; set; } // Image as byte array

        public int? CategoryId { get; set; }

        public int? Quantity { get; set; }

        public decimal? Price { get; set; }

        public string? Description { get; set; }

        public int? KitStatusId { get; set; }

        public byte[]? Lab { get; set; } // For the LAB PDF file
    }
}

