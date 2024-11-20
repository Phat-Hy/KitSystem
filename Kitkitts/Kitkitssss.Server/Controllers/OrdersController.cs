using Microsoft.AspNetCore.Mvc;
using Kitkitssss.Server.Models;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System;
using Microsoft.AspNetCore.Authorization;

namespace Kitkitssss.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class OrdersController : ControllerBase
    {
        private readonly KitkitsContext _context;

        public OrdersController(KitkitsContext context)
        {
            _context = context;
        }

        // POST: api/orders
        [HttpPost]
        public async Task<ActionResult<Order>> PostOrder(OrderDTO orderDto)
        {
            // Validate the order data
            if (orderDto == null || orderDto.OrdersItems == null || !orderDto.OrdersItems.Any())
            {
                return BadRequest("Order data is invalid.");
            }

            // Create a new Order object
            var order = new Order
            {
                UsersId = orderDto.UsersId,
                ReceiveName = orderDto.ReceiveName,
                ReceivePhoneNumbers = orderDto.ReceivePhoneNumbers,
                StreetAddress = orderDto.StreetAddress,
                CompanyName = orderDto.CompanyName,
                Apartment = orderDto.Apartment,
                City = orderDto.City,
                Postcode = orderDto.Postcode,
                TotalAmount = orderDto.TotalAmount,
                OrdersDate = DateTime.UtcNow,
                StatusId = 1, 
                OrdersItems = orderDto.OrdersItems.Select(item => new OrdersItem
                {
                    KitId = item.KitId,
                    Quantity = item.Quantity
                }).ToList()
            };

            // Add the order to the database
            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetOrder), new { id = order.OrdersId }, order);
        }

        // GET: api/orders/{id}
        [HttpGet("{id:int}")]
        public async Task<ActionResult<Order>> GetOrder(int id)
        {
            var order = await _context.Orders
                .Include(o => o.OrdersItems)
                    .ThenInclude(oi => oi.Kit)
                .Include(o => o.Status)
                .FirstOrDefaultAsync(o => o.OrdersId == id);

            if (order == null)
            {
                return NotFound("Order not found.");
            }

            return Ok(order);
        }

        // PUT: api/orders/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> PutOrder(int id, OrderDTO orderDto)
        {
            if (id != orderDto.OrdersId)
            {
                return BadRequest("Order ID mismatch.");
            }

            var order = await _context.Orders
                .Include(o => o.OrdersItems)
                .FirstOrDefaultAsync(o => o.OrdersId == id);

            if (order == null)
            {
                return NotFound("Order not found.");
            }

            // Update order properties
            order.UsersId = orderDto.UsersId;
            order.ReceiveName = orderDto.ReceiveName;
            order.ReceivePhoneNumbers = orderDto.ReceivePhoneNumbers;
            order.StreetAddress = orderDto.StreetAddress;
            order.CompanyName = orderDto.CompanyName;
            order.Apartment = orderDto.Apartment;
            order.City = orderDto.City;
            order.Postcode = orderDto.Postcode;
            order.TotalAmount = orderDto.TotalAmount;
            order.StatusId = orderDto.StatusId;

            // Update order items
            order.OrdersItems.Clear();
            foreach (var item in orderDto.OrdersItems)
            {
                order.OrdersItems.Add(new OrdersItem
                {
                    KitId = item.KitId,
                    Quantity = item.Quantity
                });
            }

            _context.Entry(order).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Orders.Any(e => e.OrdersId == id))
                {
                    return NotFound("Order not found.");
                }
                else
                {
                    throw;
                }
            }
        }

        // DELETE: api/orders/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteOrder(int id)
        {
            var order = await _context.Orders.FindAsync(id);
            if (order == null)
            {
                return NotFound("Order not found.");
            }

            _context.Orders.Remove(order);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // GET: api/orders/user/{userId}
        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetOrders(int userId)
        {
            var orders = await _context.Orders
                .Include(o => o.Status)
                .Where(o => o.UsersId == userId)
                .Select(o => new
                {
                    o.OrdersId,
                    o.OrdersDate,
                    o.TotalAmount,
                    o.StatusId,
                    StatusName = o.Status.OrdersStatusName
                })
                .ToListAsync();

            if (orders == null || !orders.Any())
            {
                return NotFound("No orders found for the specified user.");
            }

            return Ok(orders);
        }

        // PUT: api/orders/cancel/{orderId}
        [HttpPut("cancel/{orderId}")]
        public async Task<IActionResult> CancelOrder(int orderId)
        {
            var order = await _context.Orders.FindAsync(orderId);
            if (order == null)
            {
                return NotFound("Order not found.");
            }

            // Assuming status ID '1' indicates a pending order that can be canceled
            if (order.StatusId != 1)
            {
                return BadRequest("Only pending orders can be canceled.");
            }

            order.StatusId = 4; // Assuming status ID '4' indicates a canceled order

            try
            {
                await _context.SaveChangesAsync();
                return Ok("Order canceled successfully.");
            }
            catch (DbUpdateException)
            {
                return StatusCode(500, "An error occurred while canceling the order.");
            }
        }
        // PUT: api/orders/{orderId}
        [HttpPut("{orderId}/status")]
        public async Task<IActionResult> UpdateOrderStatus(int orderId, [FromBody] UpdateOrderRequest request)
        {
            var order = await _context.Orders.FindAsync(orderId);
            if (order == null)
            {
                return NotFound("Order not found.");
            }

            // Update the order status
            order.StatusId = request.StatusId;

            try
            {
                await _context.SaveChangesAsync();
                return Ok("Order status updated successfully.");
            }
            catch (DbUpdateException)
            {
                return StatusCode(500, "An error occurred while updating the order status.");
            }
        }
        // GET: api/orders
        [HttpGet]
        public async Task<IActionResult> GetAllOrders()
        {

            // Retrieve all orders, including related status and order items
            var orders = await _context.Orders
                .Include(o => o.Status)
                .Include(o => o.OrdersItems)
                    .ThenInclude(oi => oi.Kit) // If you need to include details about the kits
                .Select(o => new
                {
                    o.OrdersId,
                    o.OrdersDate,
                    o.TotalAmount,
                    o.StatusId,
                    StatusName = o.Status.OrdersStatusName,
                    OrdersItems = o.OrdersItems.Select(oi => new
                    {
                        oi.KitId,
                        oi.Quantity,
                    })
                })
                .ToListAsync();

            if (orders == null || !orders.Any())
            {
                return NotFound(new ErrorResponse { Message = "No orders found." });
            }

            return Ok(orders);
        }
    }
}
public class UpdateOrderRequest
{
    public int StatusId { get; set; }
}
public class ErrorResponse
{
    public string Message { get; set; }
}
