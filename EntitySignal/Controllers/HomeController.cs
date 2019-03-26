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

    [HttpPost]
    public async Task<ActionResult<IEnumerable<Messages>>> SubscribeTest([FromBody] SubscribePost postSubscribe)
    {
      //check if user has permissions to view this data

      var url = $"{HttpContext.Request.Path}{HttpContext.Request.QueryString}";

      var userContainer = new UserContainer()
      {
        ConnectionId = postSubscribe.ConnectionId,
        Url = url
      };

      DataSync.AddUser(typeof(Messages), userContainer);

      //initialize data for subscription
      return await _db.Messages.ToListAsync();
    }

    [HttpPost]
    public async Task<IEnumerable<Messages>> SubscribeFilterTest([FromBody] SubscribePost postSubscribe)
    {
      //check if user has permissions to view this data

      var url = $"{HttpContext.Request.Path}{HttpContext.Request.QueryString}";

      var linqFilter = _db.Messages
        .Where(x => x.Id % 2 == 1);

      var filterResults = await linqFilter.ToListAsync();

      var userContainer = new UserContainer()
      {
        ConnectionId = postSubscribe.ConnectionId,
        Url = url,
        Query = linqFilter
      };

      DataSync.AddUser(typeof(Messages), userContainer);

      //initialize data for subscription
      return filterResults;
    }

    [HttpPost]
    public async Task<ActionResult<IEnumerable<Jokes>>> SubscribeJokesTest([FromBody] SubscribePost postSubscribe)
    {
      var url = $"{HttpContext.Request.Path}{HttpContext.Request.QueryString}";

      var userContainer = new UserContainer()
      {
        ConnectionId = postSubscribe.ConnectionId,
        Url = url
      };

      DataSync.AddUser(typeof(Jokes), userContainer);

      //initialize data for subscription
      return await _db.Jokes.ToListAsync();
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
      var messages =  _db.Messages;
      _db.RemoveRange(messages);

      var jokes = _db.Jokes;
      _db.RemoveRange(jokes);
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
