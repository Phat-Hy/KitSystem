using Google.Apis.Auth;
using Kitkitssss.Server.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;

[ApiController]
[Route("api/[controller]")]
public class GoogleLoginController : ControllerBase
{
    private readonly KitkitsContext _context;
    private readonly IConfiguration _config;

    public GoogleLoginController(KitkitsContext context, IConfiguration config)
    {
        _context = context;
        _config = config;
    }

    [HttpPost]
    public async Task<IActionResult> GoogleLogin([FromBody] GoogleLoginRequest request)
    {
        try
        {
            // Validate the Google token using Google.Apis.Auth library
            var payload = await GoogleJsonWebSignature.ValidateAsync(request.TokenId, new GoogleJsonWebSignature.ValidationSettings());

            if (payload == null)
            {
                return Unauthorized("Invalid Google token.");
            }

            // Check if the user exists in the database by their email
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == payload.Email);

            if (user == null)
            {
                // If user doesn't exist, create a new user
                user = new User
                {
                    FirstName = payload.GivenName,
                    LastName = payload.FamilyName,
                    Email = payload.Email,
                    RoleId = 2, // Default role (Customer)
                    CreatedAt = DateTime.UtcNow,
                    StatusId = 1 // Active status, adjust as necessary
                };

                _context.Users.Add(user);
                await _context.SaveChangesAsync();
            }

            // Return user details (could also return a JWT token here)
            return Ok(new
            {
                user.UserId,
                user.FirstName,
                user.LastName,
                user.Email,
                RoleName = user.Role?.RoleName ?? "Customer"
            });
        }
        catch (Exception ex)
        {
            return BadRequest($"An error occurred: {ex.Message}");
        }
    }
}

public class GoogleLoginRequest
{
    public string TokenId { get; set; }
}
