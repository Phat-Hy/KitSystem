using Kitkitssss.Server.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;

[ApiController]
[Route("api/[controller]")]
public class ChangePasswordController : ControllerBase
{
    private readonly KitkitsContext _context;

    public ChangePasswordController(KitkitsContext context)
    {
        _context = context;
    }

    // PUT: api/ChangePassword/{userId}
    [HttpPut("{userId}")]
    public async Task<IActionResult> ChangePassword(int userId, [FromBody] ChangePasswordRequest request)
    {
        if (string.IsNullOrEmpty(request.OldPassword) || string.IsNullOrEmpty(request.Password))
        {
            return BadRequest("Old password and new password are required.");
        }

        // Find the user in the database
        var user = await _context.Users.FindAsync(userId);
        if (user == null)
        {
            return NotFound("User not found.");
        }

        // Check if the old password is correct
        if (user.Password != request.OldPassword)
        {
            return Unauthorized("Old password is incorrect.");
        }

        // Update the password
        user.Password = request.Password;

        // Save changes to the database
        try
        {
            await _context.SaveChangesAsync();
            return Ok(new { message = "Password updated successfully!" });
        }
        catch (DbUpdateException)
        {
            return StatusCode(500, "An error occurred while updating the password.");
        }
    }
}

// DTO for change password request
public class ChangePasswordRequest
{
    public string? OldPassword { get; set; }
    public string? Password { get; set; }
}
