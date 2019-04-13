using EntitySignal.Data;
using EntitySignal.Hubs;
using EntitySignal.Models;
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
    public IHubContext<EntitySignalHub, IDataClient> _dataHubContext { get; }

    public SubscribeController(
      ApplicationDbContext context,
      IHubContext<EntitySignalHub, IDataClient> dataHubContext
      )
    {
      _db = context;
      _dataHubContext = dataHubContext;
    }


    public async Task<ActionResult> Create()
    {
      var a = new Messages()
      {
        Name = "Dustin",
        Message = "Hey"
      };

      _db.Messages.Add(a);

      var b = new Jokes()
      {
        Leadup = "Why did the chicken cross the road",
        Punchline = "To get to the other side"
      };
      _db.Jokes.Add(b);
      await _db.SaveChangesAsync();

      return Ok();
    }


    public async Task<ActionResult> CreateFive()
    {
      for (var i = 0; i < 5; i++)
      {
        var a = new Messages()
        {
          Name = "Dustin",
          Message = "Hey"
        };
        _db.Messages.Add(a);
      }

      for (var i = 0; i < 5; i++)
      {
        var b = new Jokes()
        {
          Leadup = "Why did the chicken cross the road",
          Punchline = "To get to the other side"
        };
        _db.Jokes.Add(b);
      }

      await _db.SaveChangesAsync();

      return Ok();
    }

    [HttpPost]
    public async Task<ActionResult<IEnumerable<Messages>>> SubscribeTest([FromBody] SubscribePost postSubscribe)
    {
      //check if user has permissions to view this data

      var url = $"{HttpContext.Request.Path}{HttpContext.Request.QueryString}";

      var userContainer = new UserContainer<Messages>()
      {
        ConnectionId = postSubscribe.ConnectionId,
        Url = url
      };

      DataSync.AddUser(userContainer);

      //initialize data for subscription
      return await _db.Messages.ToListAsync();
    }

    [HttpPost]
    public IEnumerable<Messages> SubscribeFilterTest([FromBody] SubscribePost postSubscribe)
    {
      //check if user has permissions to view this data

      var url = $"{HttpContext.Request.Path}{HttpContext.Request.QueryString}";

      var userContainer = new UserContainer<Messages>()
      {
        ConnectionId = postSubscribe.ConnectionId,
        Url = url,
        Query = x => x.Id % 2 == 1
      };

      DataSync.AddUser(userContainer);

      var filterResults = _db.Messages
        .Where(userContainer.Query)
        .ToList();

      return filterResults;
    }

    [HttpPost]
    public async Task<ActionResult<IEnumerable<Jokes>>> SubscribeJokesTest([FromBody] SubscribePost postSubscribe)
    {
      var url = $"{HttpContext.Request.Path}{HttpContext.Request.QueryString}";

      var userContainer = new UserContainer<Jokes>()
      {
        ConnectionId = postSubscribe.ConnectionId,
        Url = url
      };

      DataSync.AddUser(userContainer);

      //initialize data for subscription
      return await _db.Jokes.ToListAsync();
    }

    [HttpPost]
    public IEnumerable<Jokes> SubscribeGuidJokesTest([FromBody] SubscribePost postSubscribe)
    {
      //check if user has permissions to view this data

      var url = $"{HttpContext.Request.Path}{HttpContext.Request.QueryString}";

      var userContainer = new UserContainer<Jokes>()
      {
        ConnectionId = postSubscribe.ConnectionId,
        Url = url,
        Query = x => Guid.TryParse(x.Punchline, out Guid g)
      };

      DataSync.AddUser(userContainer);

      var filterResults = _db.Jokes
        .Where(userContainer.Query)
        .ToList();

      return filterResults;
    }

    public async Task<ActionResult> ChangeRandom()
    {
      var messageCount = await _db.Messages.CountAsync();
      var random = new Random().Next(messageCount);
      var randomMessage = await _db.Messages
        .Skip(random)
        .FirstAsync();
      randomMessage.Message = Guid.NewGuid().ToString();

      var jokeCount = await _db.Jokes.CountAsync();
      var randomJokeSkip = new Random().Next(jokeCount);
      var randomJoke = await _db.Jokes
        .Skip(randomJokeSkip)
        .FirstAsync();
      randomJoke.Leadup = "Why did the guid cross the road?";
      randomJoke.Punchline = Guid.NewGuid().ToString();

      await _db.SaveChangesAsync();

      return Ok();
    }

    public async Task<ActionResult> DeleteAll()
    {
      var messages = _db.Messages;
      _db.RemoveRange(messages);

      var jokes = _db.Jokes;
      _db.RemoveRange(jokes);
      await _db.SaveChangesAsync();

      return Ok();
    }

    public async Task<ActionResult> DeleteRandom()
    {
      var messageCount = await _db.Messages.CountAsync();
      var random = new Random().Next(messageCount);
      var randomMessage = await _db.Messages
        .Skip(random)
        .FirstAsync();
      _db.Messages.Remove(randomMessage);

      var jokeCount = await _db.Jokes.CountAsync();
      var randomJokeSkip = new Random().Next(jokeCount);
      var randomJoke = await _db.Jokes
        .Skip(randomJokeSkip)
        .FirstAsync();
      _db.Jokes.Remove(randomJoke);

      await _db.SaveChangesAsync();

      return Ok();
    }

    [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
    public IActionResult Error()
    {
      return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
    }
  }
}
