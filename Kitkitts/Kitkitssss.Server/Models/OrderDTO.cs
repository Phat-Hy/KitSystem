// File: Models/OrderDTO.cs
using System.Collections.Generic;

namespace Kitkitssss.Server.Models
{
    public class OrderDTO
    {
        public int OrdersId { get; set; }  // Add this property
        public int? UsersId { get; set; }
        public string? ReceiveName { get; set; }
        public string? ReceivePhoneNumbers { get; set; }
        public string? StreetAddress { get; set; }
        public string? CompanyName { get; set; }
        public string? Apartment { get; set; }
        public string? City { get; set; }
        public string? Postcode { get; set; }
        public decimal? TotalAmount { get; set; }
        public int? StatusId { get; set; }
        public List<OrderItemDTO> OrdersItems { get; set; } = new List<OrderItemDTO>();
    }

    public class OrderItemDTO
    {
        public int? KitId { get; set; }
        public int? Quantity { get; set; }
    }
}
