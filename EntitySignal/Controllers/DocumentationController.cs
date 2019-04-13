using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace EntitySignal.Controllers
{

  public class DocumentationDisplayContainer
  {
    public String Markdown;
    public IEnumerable<string> Docs;
    public String Title;
  }

  [Route("Documentation")]
  public class DocumentationController : Controller
  {
    private readonly IHostingEnvironment _hostingEnvironment;

    public DocumentationController(
      IHostingEnvironment hostingEnvironment
      )
    {
      _hostingEnvironment = hostingEnvironment;
    }

    public async Task<IActionResult> Index()
    {
      return await Get("test");
    }

    [HttpGet("{requestedDocmentation}")]
    public async Task<IActionResult> Get(string requestedDocmentation)
    {
      string docsDirectory = Path.Combine(_hostingEnvironment.ContentRootPath, "Docs");
      var markdownFiles = Directory.GetFiles(docsDirectory)
        .Select(x=>Path.GetFileNameWithoutExtension(x));

      if (markdownFiles.Contains(requestedDocmentation) == false)
      {
        return BadRequest();
      }

      var requestedFile = Path.Combine(docsDirectory, $"{requestedDocmentation}.md");
      var markdownFileText = await System.IO.File.ReadAllTextAsync(requestedFile);

      var documentationDisplayContainer = new DocumentationDisplayContainer
      {
        Docs = markdownFiles,
        Markdown = markdownFileText,
        Title = requestedDocmentation.Replace("-", " ")
      };

      return View("Get", documentationDisplayContainer);
    }

  }
}
