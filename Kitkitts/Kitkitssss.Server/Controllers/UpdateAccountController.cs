using Kitkitssss.Server.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;

[ApiController]
[Route("api/[controller]")]
public class UpdateAccountController : ControllerBase
{
    private readonly KitkitsContext _context;

    public UpdateAccountController(KitkitsContext context)
    {
        _context = context;
    }

    // PUT: api/UpdateAccount/{userId}
    [HttpPut("{userId}")]
    public async Task<IActionResult> UpdateAccount(int userId, [FromBody] UpdateAccountRequest request)
    {
        if (request == null)
        {
            return BadRequest("Invalid request.");
        }

        // Find the user in the database
        var user = await _context.Users.FindAsync(userId);
        if (user == null)
        {
            return NotFound("User not found.");
        }

        // Update user details
        user.FirstName = request.FirstName;
        user.LastName = request.LastName;
        user.StreetAddress = request.StreetAddress;
        user.Apartment = request.Apartment;
        user.City = request.City;
        user.PostCode = request.PostCode;

        // Save changes to the database
        try
        {
            await _context.SaveChangesAsync();
            return Ok(new { message = "Profile updated successfully!" });
        }
        catch (DbUpdateException)
        {
            return StatusCode(500, "An error occurred while updating the profile.");
        }
    }
}

// DTO for update account request
public class UpdateAccountRequest
{
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? StreetAddress { get; set; }
    public string? Apartment { get; set; }
    public string? City { get; set; }
    public string? PostCode { get; set; }
}
