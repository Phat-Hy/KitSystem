using Kitkitssss.Server.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.IO;
using System.Threading.Tasks;

[ApiController]
[Route("api/[controller]")]
public class KitsController : ControllerBase
{
    private readonly KitkitsContext _context;

    public KitsController(KitkitsContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetKits(string? sortBy = null, string? search = null)
    {
        var kits = _context.Kits.AsQueryable();

        // Search functionality
        if (!string.IsNullOrEmpty(search))
        {
            kits = kits.Where(k => k.KitName.Contains(search));
        }

        // Sorting functionality
        kits = sortBy switch
        {
            "name" => kits.OrderBy(k => k.KitName),
            "priceLowToHigh" => kits.OrderBy(k => k.Price),
            "priceHighToLow" => kits.OrderByDescending(k => k.Price),
            _ => kits // No specific sorting
        };

        try
        {
            var result = await kits.Select(k => new
            {
                k.KitId,
                k.KitName,
                k.Description,
                k.Price,
                KitImage = k.KitImage != null ? Convert.ToBase64String(k.KitImage) : null
            }).ToListAsync(); // Select only the necessary fields
            return Ok(result);
        }
        catch (Exception ex)
        {
            // Log the exception for debugging
            Console.WriteLine($"Error fetching kits: {ex}");
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }
    [Authorize]
    [HttpPost]
    public async Task<IActionResult> AddKit([FromForm] Kit kit, IFormFile image, IFormFile labFile)
    {
        // Validate input files
        if (image == null || labFile == null)
        {
            return BadRequest("Both image and lab files are required.");
        }

        // Check if the category exists
        var category = await _context.Categories
            .FirstOrDefaultAsync(c => c.CategoryId == kit.CategoryId);

        if (category == null)
        {
            return NotFound($"Category with ID {kit.CategoryId} does not exist.");
        }

        // Proceed with adding the kit
        using (var memoryStream = new MemoryStream())
        {
            await image.CopyToAsync(memoryStream);
            kit.KitImage = memoryStream.ToArray();
        }

        using (var memoryStream = new MemoryStream())
        {
            await labFile.CopyToAsync(memoryStream);
            kit.Lab = memoryStream.ToArray();
        }

        _context.Kits.Add(kit);

        try
        {
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetKits), new { id = kit.KitId }, kit);
        }
        catch (DbUpdateException dbEx)
        {
            Console.WriteLine($"Database update error: {dbEx.InnerException?.Message}");
            return StatusCode(500, "Internal server error while saving the kit.");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error adding kit: {ex.Message}");
            return StatusCode(500, "Internal server error.");
        }
    }
    [Authorize]
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateKit(int id, [FromForm] KitUpdate kitUpdate, IFormFile kitImage, IFormFile labPdf)
    {
        // Check if the provided id matches the KitId in the request body
        if (id != kitUpdate.KitId)
        {
            return BadRequest("The Kit ID in the URL does not match the Kit ID in the request body.");
        }

        // Fetch the kit from the database
        var kit = await _context.Kits.FindAsync(id);
        if (kit == null)
        {
            return NotFound($"No kit found with ID {id}.");
        }

        // Validate required fields
        if (string.IsNullOrWhiteSpace(kitUpdate.KitName))
        {
            return BadRequest("KitName is required.");
        }

        if (string.IsNullOrWhiteSpace(kitUpdate.Description))
        {
            return BadRequest("Description is required.");
        }

        // Update properties of the kit
        kit.KitName = kitUpdate.KitName;
        kit.Description = kitUpdate.Description;
        kit.Quantity = kitUpdate.Quantity;
        kit.Price = kitUpdate.Price;

        // Check for required file uploads and assign the byte arrays
        if (kitImage != null && kitImage.Length > 0)
        {
            using (var memoryStream = new MemoryStream())
            {
                await kitImage.CopyToAsync(memoryStream);
                kit.KitImage = memoryStream.ToArray(); // Ensure this matches the expected property type in your model
            }
        }
        else
        {
            return BadRequest("KitImage is required.");
        }

        if (labPdf != null && labPdf.Length > 0)
        {
            using (var memoryStream = new MemoryStream())
            {
                await labPdf.CopyToAsync(memoryStream);
                kit.Lab = memoryStream.ToArray(); // Ensure this matches the expected property type in your model
            }
        }
        else
        {
            return BadRequest("Lab PDF is required.");
        }

        // Update category and status if provided
        if (kitUpdate.CategoryId.HasValue)
        {
            kit.CategoryId = kitUpdate.CategoryId.Value;
        }

        if (kitUpdate.KitStatusId.HasValue)
        {
            kit.KitStatusId = kitUpdate.KitStatusId.Value;
        }

        // Save changes to the database
        await _context.SaveChangesAsync();
        return NoContent(); // Return a 204 No Content status code to indicate successful update
    }
    [HttpGet("{id}")]
    public async Task<IActionResult> GetKitById(int id)
    {
        var kit = await _context.Kits.FindAsync(id); // Adjust this according to your context

        if (kit == null)
        {
            return NotFound(); // Return 404 if kit not found
        }

        return Ok(kit); // Return the kit details if found
    }
    // Add this method to the KitsController
    [Authorize]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteKit(int id)
    {
        // Find the kit by its ID
        var kit = await _context.Kits.FindAsync(id);
        if (kit == null)
        {
            return NotFound($"Kit with ID {id} does not exist.");
        }

        // Remove the kit from the database
        _context.Kits.Remove(kit);

        try
        {
            await _context.SaveChangesAsync();
            return NoContent(); // Return 204 No Content to indicate successful deletion
        }
        catch (DbUpdateException dbEx)
        {
            // Log the error and return an appropriate response
            Console.WriteLine($"Database update error: {dbEx.InnerException?.Message}");
            return StatusCode(500, "Internal server error while deleting the kit.");
        }
        catch (Exception ex)
        {
            // Log the error and return an appropriate response
            Console.WriteLine($"Error deleting kit: {ex.Message}");
            return StatusCode(500, "Internal server error.");
        }
    }
}
