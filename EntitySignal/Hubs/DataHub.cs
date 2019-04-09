using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace EntitySignal.Hubs
{
  public class DataContainer
  {
    public Type Type { get; set; }
    public string IdField { get; set; }
    public object Object { get; set; }
    public EntityState State { get; set; }
    public string Url { get; set; }
  }

  public interface IDataClient
  {
    Task Sync(UserContainerResult data);
  }

  public class UserContainer<T> : IUserContainer
  {
    public string ConnectionId { get; set; }
    public string Url { get; set; }
    public Func<T, bool> Query { get; set; }
  }

  public interface IUserContainer
  {
    string ConnectionId { get; set; }
  }

  public class UserContainerResult
  {
    public string ConnectionId;
    public List<UserUrlSubscriptions> Urls = new List<UserUrlSubscriptions>();
  }

  public class UserUrlSubscriptions
  {
    public string Url;
    public List<DataContainer> Data = new List<DataContainer>();
  }

  public class SubscriptionsByUser
  {
    public ConcurrentDictionary<string, SubscriptionsByUrl> ByUser = new ConcurrentDictionary<string, SubscriptionsByUrl>();
    public Type SubscriptionType;
  }

  public class SubscriptionsByUrl
  {
    public ConcurrentDictionary<string, IUserContainer> ByUrl = new ConcurrentDictionary<string, IUserContainer>();
    public Type SubscriptionType;
  }

  public class DataSync
  {
    public static ConcurrentDictionary<Type, SubscriptionsByUser> SubscriptionsByType { get; set; } = new ConcurrentDictionary<Type, SubscriptionsByUser>();

    public static int ConnectionCount;

    // DO NOT REMOVE, ACCESSED BY STRING
    public static List<UserContainerResult> GetSubscribed<T>(SubscriptionsByUser subscriptionsByUser, List<DataContainer> values)
    {
      var results = new List<UserContainerResult>();

      foreach (var user in subscriptionsByUser.ByUser)
      {
        if(user.Value == null)
        {
          continue;
        }

        var userResults = new UserContainerResult
        {
          ConnectionId = user.Key
        };

        foreach (var url in user.Value.ByUrl)
        {
          if(url.Value == null)
          {
            continue;
          }

          IUserContainer interfaceSubscription = url.Value;
          UserContainer<T> typedSubscription = (UserContainer<T>)interfaceSubscription;

          foreach (var value in values)
          {
            var typedObject = (T)value.Object;

            if (typedSubscription.Query == null || typedSubscription.Query.Invoke(typedObject))
            {
              var newUrl = new UserUrlSubscriptions
              {
                Url = url.Key
              };

              newUrl.Data.Add(value);

              userResults.Urls.Add(newUrl);
            }
          }
        }

        if (userResults.Urls.Any())
        {
          results.Add(userResults);
        }
      }

      return results;
    }


    public static void AddUser<T>(UserContainer<T> user)
    {
      //attempt to get type subscription
      SubscriptionsByUser subscriptionsByUser;
      SubscriptionsByType.TryGetValue(typeof(T), out subscriptionsByUser);

      //if unable to get attempt to add
      if (subscriptionsByUser == null)
      {
        subscriptionsByUser = new SubscriptionsByUser()
        {
          SubscriptionType = typeof(T)
        };

        //add new type subscription
        var wasAdded = SubscriptionsByType.TryAdd(typeof(T), subscriptionsByUser);

        //if add failed then likely another thread was adding at the same time, try again
        if (!wasAdded)
        {
          AddUser<T>(user);
          return;
        }
      }


      //attempt to get user subscription
      SubscriptionsByUrl subscriptionsByUrl;
      subscriptionsByUser.ByUser.TryGetValue(user.ConnectionId, out subscriptionsByUrl);

      //if unable to get attempt to add
      if(subscriptionsByUrl == null)
      {
        subscriptionsByUrl = new SubscriptionsByUrl()
        {
          SubscriptionType = typeof(T)
        };

        //add new type subscription
        var wasAdded = subscriptionsByUser.ByUser.TryAdd(user.ConnectionId, subscriptionsByUrl);

        //if add failed then likely another thread was adding at the same time, try again
        if (!wasAdded)
        {
          AddUser<T>(user);
          return;
        }
      }

      //add or update value with new value
      subscriptionsByUrl.ByUrl.AddOrUpdate(user.Url, user, (key, oldValue) => oldValue = user);
    }

    public async static Task RemoveConnection(string connectionId)
    {
      foreach (var typeSubscription in SubscriptionsByType)
      {
        if(typeSubscription.Value == null)
        {
          continue;
        }

        if (typeSubscription.Value.ByUser.ContainsKey(connectionId))
        {
          var removesuccess = typeSubscription.Value.ByUser.TryRemove(connectionId, out _);
          if (!removesuccess)
          {
            var newRand = new Random();
            await Task.Delay(newRand.Next(50));
            await RemoveConnection(connectionId);
          }
        }
      }

      return;
    }
  }

  public class DataHub : Hub<IDataClient>
  {
    private static Mutex mut = new Mutex();

    public override Task OnConnectedAsync()
    {
      mut.WaitOne(1000);
      DataSync.ConnectionCount++;
      mut.ReleaseMutex();

      return base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception exception)
    {
      mut.WaitOne(1000);
      DataSync.ConnectionCount--;
      mut.ReleaseMutex();

      await DataSync.RemoveConnection(Context.ConnectionId);
      await base.OnDisconnectedAsync(exception);
    }

  }
}
