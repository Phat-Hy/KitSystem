using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Kitkitssss.Server.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Kitkitssss.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class KitStatusesController : ControllerBase
    {
        private readonly KitkitsContext _context;

        public KitStatusesController(KitkitsContext context)
        {
            _context = context;
        }

        // GET: api/kitstatuses
        [HttpGet]
        public async Task<ActionResult<IEnumerable<KitStatus>>> GetKitStatuses()
        {
            return await _context.KitStatuses.ToListAsync();
        }

        // GET: api/kitstatuses/5
        [HttpGet("{id}")]
        public async Task<ActionResult<KitStatus>> GetKitStatus(int id)
        {
            var kitStatus = await _context.KitStatuses.FindAsync(id);

            if (kitStatus == null)
            {
                return NotFound();
            }

            return kitStatus;
        }

        // POST: api/kitstatuses
        [HttpPost]
        public async Task<ActionResult<KitStatus>> PostKitStatus(KitStatus kitStatus)
        {
            _context.KitStatuses.Add(kitStatus);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetKitStatus", new { id = kitStatus.KitStatusId }, kitStatus);
        }

        // PUT: api/kitstatuses/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutKitStatus(int id, KitStatus kitStatus)
        {
            if (id != kitStatus.KitStatusId)
            {
                return BadRequest();
            }

            _context.Entry(kitStatus).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!KitStatusExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // DELETE: api/kitstatuses/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteKitStatus(int id)
        {
            var kitStatus = await _context.KitStatuses.FindAsync(id);
            if (kitStatus == null)
            {
                return NotFound();
            }

            _context.KitStatuses.Remove(kitStatus);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool KitStatusExists(int id)
        {
            return _context.KitStatuses.Any(e => e.KitStatusId == id);
        }
    }
}
