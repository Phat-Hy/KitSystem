using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Kitkitssss.Server.Models;

namespace Kitkitssss.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly KitkitsContext _context;

        public UsersController(KitkitsContext context)
        {
            _context = context;
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<User>> GetUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound();
            }
            return user;
        }
    }
}
