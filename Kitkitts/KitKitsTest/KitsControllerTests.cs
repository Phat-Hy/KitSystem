using Kitkitssss.Server.Controllers;
using Kitkitssss.Server.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.IO;
using System.Threading.Tasks;
using Xunit;

public class KitsControllerTests
{
    private readonly KitsController _controller;
    private readonly KitkitsContext _context;

    public KitsControllerTests()
    {
        var options = new DbContextOptionsBuilder<KitkitsContext>()
            .UseInMemoryDatabase(databaseName: "TestDatabase")
            .Options;

        _context = new KitkitsContext(options);
        _context.Database.EnsureDeleted();  // Clear the database before each test
        _context.Database.EnsureCreated();

        _controller = new KitsController(_context);

        // Seed the database with a kit for testing purposes
        SeedDatabase();
    }

    private void SeedDatabase()
{
    var kit = new Kit
    {
        KitName = "Existing Kit",
        Description = "This is an existing kit.",
        Price = 150.00m,
        Quantity = 5,
        CategoryId = 1 // Assuming this category exists in the database
    };

    _context.Kits.Add(kit);
    _context.SaveChanges();
}

    [Fact]
    public async Task AddKit_ReturnsCreatedResult_WhenKitIsValid()
    {
        // Arrange
        var category = new Category { CategoryId = 1, CategoryName = "Test Category" };
        _context.Categories.Add(category);
        await _context.SaveChangesAsync();

        var kit = new Kit
        {
            KitName = "Test Kit",
            Description = "This is a test kit.",
            Price = 100.00m,
            Quantity = 10,
            CategoryId = 1 // Make sure this category exists
        };

        var imageFile = GenerateFormFile("testImage.jpg");
        var labFile = GenerateFormFile("testLab.pdf");

        // Act
        var result = await _controller.AddKit(kit, imageFile, labFile);

        // Assert
        var createdResult = Assert.IsType<CreatedAtActionResult>(result);
        Assert.Equal("GetKits", createdResult.ActionName);
        Assert.NotNull(createdResult.Value);
        Assert.IsType<Kit>(createdResult.Value);
    }

    [Fact]
    public async Task AddKit_ReturnsBadRequest_WhenImageIsMissing()
    {
        // Arrange
        var kit = new Kit
        {
            KitName = "Test Kit",
            Description = "This is a test kit.",
            Price = 100.00m,
            Quantity = 10,
            CategoryId = 1 // Assuming this category exists in the database
        };

        // Act
        var result = await _controller.AddKit(kit, null, null); // Missing image and lab file

        // Assert
        var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
        Assert.Equal("Both image and lab files are required.", badRequestResult.Value);
    }

    private IFormFile GenerateFormFile(string fileName)
    {
        var stream = new MemoryStream();
        var writer = new StreamWriter(stream);
        writer.Write("Sample file content");
        writer.Flush();
        stream.Position = 0;  // Reset the position to the beginning

        return new FormFile(stream, 0, stream.Length, "file", fileName);
    }


    // UpdateKit Test Cases

    [Fact]
    public async Task UpdateKit_ReturnsNoContent_WhenKitIsValid()
    {
        // Arrange
        var kitUpdate = new KitUpdate
        {
            KitId = 1, // ID of the kit we are updating
            KitName = "Updated Kit",
            Description = "This is an updated kit.",
            Price = 120.00m,
            Quantity = 10,
            CategoryId = 1 // Assuming this category exists
        };

        var imageFile = GenerateFormFile("updatedImage.jpg");
        var labFile = GenerateFormFile("updatedLab.pdf");

        // Act
        var result = await _controller.UpdateKit(1, kitUpdate, imageFile, labFile);

        // Assert
        var noContentResult = Assert.IsType<NoContentResult>(result);
        Assert.Equal(204, noContentResult.StatusCode);

        // Verify the update
        var updatedKit = await _context.Kits.FindAsync(1);
        Assert.NotNull(updatedKit);
        Assert.Equal("Updated Kit", updatedKit.KitName);
        Assert.Equal("This is an updated kit.", updatedKit.Description);
        Assert.Equal(120.00m, updatedKit.Price);
        Assert.Equal(10, updatedKit.Quantity);
    }

    [Fact]
    public async Task UpdateKit_ReturnsBadRequest_WhenIdDoesNotMatch()
    {
        // Arrange
        var kitUpdate = new KitUpdate
        {
            KitId = 2, // ID that does not match the kit in the URL
            KitName = "Updated Kit",
            Description = "This is an updated kit.",
            Price = 120.00m,
            Quantity = 10,
            CategoryId = 1 // Assuming this category exists
        };

        var imageFile = GenerateFormFile("updatedImage.jpg");
        var labFile = GenerateFormFile("updatedLab.pdf");

        // Act
        var result = await _controller.UpdateKit(1, kitUpdate, imageFile, labFile); // URL ID is 1, but kitUpdate ID is 2

        // Assert
        var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
        Assert.Equal("The Kit ID in the URL does not match the Kit ID in the request body.", badRequestResult.Value);
    }

    // GetKitById Test Cases

    [Fact]
    public async Task GetKitById_ReturnsKit_WhenKitExists()
    {
        // Act
        var result = await _controller.GetKitById(1);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var returnedKit = Assert.IsType<Kit>(okResult.Value);
        Assert.Equal(1, returnedKit.KitId);
        Assert.Equal("Existing Kit", returnedKit.KitName);
        Assert.Equal("This is an existing kit.", returnedKit.Description);
        Assert.Equal(150.00m, returnedKit.Price);
        Assert.Equal(5, returnedKit.Quantity);
    }

    [Fact]
    public async Task GetKitById_ReturnsNotFound_WhenKitDoesNotExist()
    {
        // Act
        var result = await _controller.GetKitById(999); // ID that does not exist in the database

        // Assert
        Assert.IsType<NotFoundResult>(result);
    }
}
