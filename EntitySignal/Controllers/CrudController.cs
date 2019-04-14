using EntitySignal.Data;
using EntitySignal.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace EntitySignal.Controllers
{
  public class CrudController : Controller
  {
    private ApplicationDbContext _db;

    public CrudController(
      ApplicationDbContext context
      )
    {
      _db = context;
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

  }
}
