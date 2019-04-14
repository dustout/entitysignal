using EntitySignal.Data;
using EntitySignal.Models;
using EntitySignal.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;

namespace EntitySignal.Controllers
{

  [ResponseCache(NoStore = true, Duration = 0)]
  public class SubscribeController : Controller
  {
    private ApplicationDbContext _db;
    private EntitySignalSubscribe _entitySignalSubscribe;

    public SubscribeController(
      ApplicationDbContext context,
      EntitySignalSubscribe entitySignalSubscribe
      )
    {
      _db = context;
      _entitySignalSubscribe = entitySignalSubscribe;
    }

    [HttpPost]
    public ActionResult<IEnumerable<Messages>> SubscribeToAllMessages([FromBody] SubscribePost postSubscribe)
    {
      _entitySignalSubscribe.Subscribe<Messages>(postSubscribe.ConnectionId);

      return _db.Messages.ToList();
    }

    [HttpPost]
    public IEnumerable<Messages> SubscribeToOddIdMessages([FromBody] SubscribePost postSubscribe)
    {
      var userContainer = _entitySignalSubscribe.Subscribe<Messages>(postSubscribe.ConnectionId, x=> x.Id % 2 == 1);

      return _db.Messages
        .Where(userContainer.Query)
        .ToList();
    }

    [HttpPost]
    public async Task<ActionResult<IEnumerable<Jokes>>> SubscribeToAllJokes([FromBody] SubscribePost postSubscribe)
    {
      _entitySignalSubscribe.Subscribe<Jokes>(postSubscribe.ConnectionId);

      return await _db.Jokes.ToListAsync();
    }

    [HttpPost]
    public IEnumerable<Jokes> SubscribeToJokesWithGuidAnswer([FromBody] SubscribePost postSubscribe)
    {
      var userContainer = _entitySignalSubscribe.Subscribe<Jokes>(postSubscribe.ConnectionId, x => Guid.TryParse(x.Punchline, out Guid g));
     
      return _db.Jokes
        .Where(userContainer.Query)
        .ToList();
    }

    [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
    public IActionResult Error()
    {
      return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
    }
  }
}
