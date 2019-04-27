using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace EntitySignal.Controllers
{
  public class ExampleController : Controller
  {
    public IActionResult AngularJs()
    {
      return View();
    }

    public IActionResult VueJs()
    {
      return View();
    }

    public IActionResult React()
    {
      return View();
    }
  }
}
