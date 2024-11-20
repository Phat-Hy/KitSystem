using Kitkitssss.Server.Models;
using Kitkitssss.Server.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;

[ApiController]
[Route("api/[controller]")]
public class LoginController : ControllerBase
{
    private readonly KitkitsContext _context;
    private readonly TokenService _tokenService;

    public LoginController(KitkitsContext context, TokenService tokenService)
    {
        _context = context;
        _tokenService = tokenService;
    }

    // POST: api/Login
    [HttpPost]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        if (string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.Password))
        {
            return BadRequest("Email and password are required.");
        }

        var user = await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Email == request.Email);

        if (user == null || request.Password != user.Password)
        {
            return Unauthorized("Invalid email or password.");
        }


        var userToken = _tokenService.GenerateToken(user.Email, user.UserId, user.RoleId.Value);

        return Ok(new
        {
            user.UserId,
            user.FirstName,
            user.LastName,
            RoleId = user.Role?.RoleId ?? 0, // Ensure RoleId is included
            user.Email,
            Token = userToken
        });
    }

    // Optional: Logout method to clear the session
    [HttpPost]
    [Route("logout")]
    public IActionResult Logout()
    {
        HttpContext.Session.Clear(); // Clear the session
        return Ok("Logged out successfully.");
    }
}

// DTO for login request
public class LoginRequest
{
    public string Email { get; set; }
    public string Password { get; set; }
}
