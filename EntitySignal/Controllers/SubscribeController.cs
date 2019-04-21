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

    [HttpGet]
    public ActionResult<IEnumerable<Message>> SubscribeToAllMessages()
    {
      _entitySignalSubscribe.Subscribe<Message>();

      return _db.Messages.ToList();
    }

    [HttpGet]
    public IEnumerable<Message> SubscribeToOddIdMessages()
    {
      var userContainer = _entitySignalSubscribe.Subscribe<Message>(x=> x.Id % 2 == 1);

      return _db.Messages
        .Where(userContainer.Query)
        .ToList();
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Joke>>> SubscribeToAllJokes()
    {
      _entitySignalSubscribe.Subscribe<Joke>();

      return await _db.Jokes.ToListAsync();
    }

    [HttpGet]
    public IEnumerable<Joke> SubscribeToJokesWithGuidAnswer()
    {
      var userContainer = _entitySignalSubscribe.Subscribe<Joke>(x => Guid.TryParse(x.Punchline, out Guid g));
     
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
