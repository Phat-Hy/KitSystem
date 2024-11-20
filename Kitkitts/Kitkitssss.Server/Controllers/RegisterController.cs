using Kitkitssss.Server.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Kitkitssss.Server.Services;
using System;
using System.Threading.Tasks;

[ApiController]
[Route("api/[controller]")]
public class RegisterController : ControllerBase
{
    private readonly KitkitsContext _context;
    private readonly TokenService _tokenService;

    public RegisterController(KitkitsContext context, TokenService tokenService)
    {
        _context = context;
         _tokenService = tokenService;
    }

    // POST: api/Register
    [HttpPost]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        if (string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.Password))
        {
            return BadRequest("Email and password are required.");
        }

        // Validate RoleId
        if (request.RoleId < 1 || request.RoleId > 3)
        {
            return BadRequest("RoleId must be between 1 and 3.");
        }

        // Check if the email is already registered
        var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
        if (existingUser != null)
        {
            return Conflict(new { message = "Email already registered." }); // 409 Conflict
        }

        // Generate a unique token for the new user
       
        // Create a new user with a unique token
        var newUser = new User
        {
            FirstName = request.FirstName,
            LastName = request.LastName,
            Email = request.Email,
            Password = request.Password,
            RoleId = request.RoleId.Value, // Ensure RoleId is not null since we validated it
            CreatedAt = DateTime.UtcNow,
        };

        _context.Users.Add(newUser);
        await _context.SaveChangesAsync();

        var userToken = _tokenService.GenerateToken(newUser.Email, newUser.UserId, newUser.RoleId.Value);


        // Map RoleId to RoleName
        string roleName = newUser.RoleId switch
        {
            1 => "Admin",
            2 => "Member",
            3 => "Staff",
            _ => "Unknown" // Fallback, should never hit this due to validation
        };

        // Return user details with the generated token and role name
        return Ok(new
        {
            newUser.UserId,
            newUser.FirstName,
            newUser.LastName,
            newUser.Email,
            RoleName = roleName // Return role name instead of RoleId
        });
    }
}

public class RegisterRequest
{
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string Email { get; set; }
    public string Password { get; set; }
    public int? RoleId { get; set; } // Optional RoleId, allows setting RoleId to 1 or 3
}
