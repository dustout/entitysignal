﻿using EntitySignal.Data;
using EntitySignal.Models;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace EntitySignal.Controllers
{

    public class SubscribePost
    {
        public string ConnectionId { get; set; }
    }

    [ResponseCache(NoStore = true, Duration = 0)]
    public class HomeController : Controller
    {
        private readonly IWebHostEnvironment _hostingEnvironment;

        public HomeController(
          IWebHostEnvironment hostingEnvironment
          )
        {
            _hostingEnvironment = hostingEnvironment;
        }

        public IActionResult Index()
        {
            ViewData["IsRoot"] = true;
            return View();
        }

        [HttpGet("stats")]
        public IActionResult Stats()
        {
            return View();
        }

        [HttpGet("quick-start")]
        public async Task<IActionResult> QuickStart()
        {
            string quickStartPath = Path.Combine(_hostingEnvironment.ContentRootPath, "Docs", "Quick-Start.md");
            var markdownFileText = await System.IO.File.ReadAllTextAsync(quickStartPath);

            return View(model: markdownFileText);
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}
