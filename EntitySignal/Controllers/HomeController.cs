using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using EntitySignal.Models;
using Microsoft.AspNetCore.SignalR;
using EntitySignal.Hubs;
using EntitySignal.Data;
using Microsoft.EntityFrameworkCore;

namespace EntitySignal.Controllers
{

  public class SubscribePost
  {
    public string ConnectionId { get; set; }
  }

  public class HomeController : Controller
  {
    private ApplicationDbContext _db;
    public IHubContext<DataHub, IDataClient> _dataHubContext { get; }

    public HomeController(
      ApplicationDbContext context,
      IHubContext<DataHub, IDataClient> dataHubContext
      )
    {
      _db = context;
      _dataHubContext = dataHubContext;
    }

    public async Task<IActionResult> Index()
    {
      var messages = await _db.Messages
         .ToListAsync();

      return View();
    }

    public async Task<ActionResult> Test()
    {
      return Ok();
    }

    public async Task<ActionResult> Create()
    {
      var a = new Messages()
      {
        Name = "Dustin",
        Message = "Hey"
      };

      _db.Messages.Add(a);
      await _db.SaveChangesAsync();

      return Ok();
    }

    [HttpPost]
    public async Task<ActionResult<IEnumerable<Messages>>> SubscribeTest([FromBody] SubscribePost postSubscribe)
    {
      //check if user has permissions to view this data

      //subscribe user
      await _dataHubContext.Groups.AddToGroupAsync(postSubscribe.ConnectionId, "Subscribed");

      //initialize data for subscription
      return await _db.Messages.ToListAsync();
    }

    public async Task<ActionResult> ChangeRandom()
    {
      var messageCount = await _db.Messages.CountAsync();
      var random = new Random().Next(messageCount);

      var randomMessage = await _db.Messages
        .Skip(random)
        .FirstAsync();

      randomMessage.Message = Guid.NewGuid().ToString();
      await _db.SaveChangesAsync();

      return Ok();
    }

    public async Task<ActionResult> DeleteAll()
    {
      var messages =  _db.Messages;
      _db.RemoveRange(messages);
      await _db.SaveChangesAsync();

      return Ok();
    }

    public async Task<ActionResult<IEnumerable<Messages>>> GetAll()
    {
      return await _db.Messages.ToListAsync();
    }

    public IActionResult Privacy()
    {
      return View();
    }

    [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
    public IActionResult Error()
    {
      return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
    }
  }
}
