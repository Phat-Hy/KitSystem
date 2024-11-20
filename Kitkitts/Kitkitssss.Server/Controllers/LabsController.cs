using Microsoft.AspNetCore.Mvc;
using Kitkitssss.Server.Models; // Ensure you include your models namespace
using System.Linq;
using static System.Net.Mime.MediaTypeNames;
using System.Reflection.PortableExecutable;
using System.Xml.Linq;
using PdfSharp.Pdf;
using PdfSharp.Drawing;
using PdfSharp.Pdf.IO;

namespace Kitkitssss.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LabsController : ControllerBase
    {
        private readonly KitkitsContext _context; // Use your KitkitsContext

        public LabsController(KitkitsContext context) // Inject your KitkitsContext
        {
            _context = context;
        }

        [HttpGet]
        public IActionResult GetFinishedOrdersWithLabs()
        {
            var finishedOrders = _context.Orders
                .Where(o => o.StatusId == 3) // Filter by finished status
                .Select(o => new
                {
                    o.OrdersId,
                    o.UsersId,
                    o.ReceiveName,
                    o.ReceivePhoneNumbers,
                    LabFiles = o.OrdersItems.Select(oi => new
                    {
                        oi.Kit.KitId,
                        oi.Kit.KitName,
                        oi.Kit.Description,
                        oi.Kit.Lab
                    }).ToList()
                })
                .ToList();

            if (finishedOrders == null || !finishedOrders.Any())
            {
                return NotFound("No finished orders with lab files found.");
            }

            var result = finishedOrders.Select(o => new
            {
                o.OrdersId,
                o.UsersId,
                o.ReceiveName,
                o.ReceivePhoneNumbers,
                LabFiles = o.LabFiles.Select(oi => new
                {
                    oi.KitId,
                    oi.KitName,
                    oi.Description,
                    PdfData = oi.Lab != null ? Convert.ToBase64String(AddUserNameToPdf(oi.Lab, o.ReceiveName)) : null // Add user's name to PDF
                }).ToList()
            });

            return Ok(result);
        }

        private static byte[] AddUserNameToPdf(byte[] pdfData, string userName)
        {
            using (MemoryStream memoryStream = new MemoryStream())
            {
                using (PdfDocument pdf = PdfReader.Open(new MemoryStream(pdfData), PdfDocumentOpenMode.Modify))
                {
                    if (pdf.PageCount > 0)
                    {
                        PdfPage page = pdf.Pages[0];
                        XGraphics gfx = XGraphics.FromPdfPage(page);

                        // Create font without specifying the style
                        XFont font = new XFont("Verdana", 20);

                        // Draw the user's name at the top of the PDF
                        gfx.DrawString($"Prepared for: {userName}", font, XBrushes.Black, new XRect(20, 20, page.Width.Point, 50), XStringFormats.TopLeft);
                    }
                    pdf.Save(memoryStream);
                }
                return memoryStream.ToArray();
            }
        }


    }
}
