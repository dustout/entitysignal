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
    private EntitySignalSubscribe _entitySignal;

    public SubscribeController(
      ApplicationDbContext context,
      EntitySignalSubscribe entitySignalSubscribe
      )
    {
      _db = context;
      _entitySignal = entitySignalSubscribe;
    }

    [HttpGet]
    public ActionResult<IEnumerable<Message>> SubscribeToAllMessages()
    {
      _entitySignal.Subscribe<Message>();

      return _db.Messages.ToList();
    }

    [HttpGet]
    public IEnumerable<Message> SubscribeToOddIdMessages()
    {
      var userContainer = _entitySignal.Subscribe<Message>(x=> x.Id % 2 == 1);

      return _db.Messages
        .Where(userContainer.Query)
        .ToList();
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Joke>>> SubscribeToAllJokes()
    {
      _entitySignal.Subscribe<Joke>();

      return await _db.Jokes.ToListAsync();
    }

    [HttpGet]
    public IEnumerable<Joke> SubscribeToJokesWithGuidAnswer()
    {
      var userContainer = _entitySignal.Subscribe<Joke>(x => Guid.TryParse(x.Punchline, out Guid g));
     
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
