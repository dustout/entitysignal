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

    private string GetRandomName()
    {
      var possibleNames = new string[] { "Jennifer", "Amanda", "Jessica", "Melissa", "Sarah", "Heather", "Nicole", "Stephanie", "Michael", "Christopher", "Jason", "David", "Dustin" };

      var random = new Random().Next(possibleNames.Count());
      return possibleNames[random];
    }

    private string GetRandomMessageText()
    {
      var possibleMessages = new string[] { "Hi", "Morning", "How are things?", "What's New!", "G'day!", "It's good to see you"};

      var random = new Random().Next(possibleMessages.Count());
      return possibleMessages[random];
    }

    private Message GenerateNewMessage()
    {
      var newMessage = new Message()
      {
        Name = GetRandomName(),
        Text = GetRandomMessageText()
      };

      return newMessage;
    }

    private string GetRandomAnimalName()
    {
      var possibleAnimals = new string[] { "Cat", "Dog", "Bird", "Lion", "Elephant", "Bear", "Tiger", "Fox", "Snake", "Rabbit", "Horse" };

      var random = new Random().Next(possibleAnimals.Count());
      return possibleAnimals[random];
    }

    private Joke GenerateNewJoke()
    {
      var newJoke = new Joke()
      {
        Leadup = $"Why did the {GetRandomAnimalName()} cross the road?",
        Punchline = "To get to the other side!"
      };

      return newJoke;
    }

    public async Task<ActionResult> Create()
    {
      var newMessage = GenerateNewMessage();
      _db.Messages.Add(newMessage);

      var newJoke = GenerateNewJoke();
      _db.Jokes.Add(newJoke);

      await _db.SaveChangesAsync();

      return Ok();
    }

    public ActionResult CreateFive()
    {
      for (var i = 0; i < 5; i++)
      {
        var newMessage = GenerateNewMessage();
        _db.Messages.Add(newMessage);
      }

      for (var i = 0; i < 5; i++)
      {
        var newJoke = GenerateNewJoke();
        _db.Jokes.Add(newJoke);
      }

      _db.SaveChanges();

      return Ok();
    }

    public async Task<ActionResult> ChangeRandom()
    {
      var messageCount = await _db.Messages.CountAsync();
      var random = new Random().Next(messageCount);
      var randomMessage = await _db.Messages
        .Skip(random)
        .FirstAsync();
      randomMessage.Text = Guid.NewGuid().ToString();

      var jokeCount = await _db.Jokes.CountAsync();
      var randomJokeSkip = new Random().Next(jokeCount);
      var randomJoke = await _db.Jokes
        .Skip(randomJokeSkip)
        .FirstAsync();
      randomJoke.Leadup = "Why did the GUID cross the road?";
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
