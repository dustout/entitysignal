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

    public SubscribeController(
      ApplicationDbContext context
      )
    {
      _db = context;
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

    [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
    public IActionResult Error()
    {
      return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
    }
  }
}
