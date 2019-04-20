using EntitySignal.Hubs;
using EntitySignal.Models;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace EntitySignal.Services
{
  public class EntitySignalDataStore
  {

    //HOW DATA IS STORED
    //TYPE --> ConnectionId --> URL Subscription -->
    public static ConcurrentDictionary<Type, SubscriptionsByType> SubscriptionsByType { get; set; } = new ConcurrentDictionary<Type, SubscriptionsByType>();

    // DO NOT REMOVE, ACCESSED BY STRING, I KNOW IT'S NASTY
    public static List<UserSubscriptionResult> GetSubscribed<T>(SubscriptionsByType subscriptionsByUser, List<ChangedObject> values)
    {
      var results = new List<UserSubscriptionResult>();

      foreach (var user in subscriptionsByUser.SubscriptionsByUser)
      {
        if(user.Value == null)
        {
          continue;
        }

        var userResults = new UserSubscriptionResult
        {
          ConnectionId = user.Key
        };

        foreach (var url in user.Value.SubscriptionsByUrl)
        {
          if(url.Value == null)
          {
            continue;
          }

          IURLSubscription interfaceSubscription = url.Value;
          UrlSubscription<T> typedSubscription = (UrlSubscription<T>)interfaceSubscription;

          foreach (var value in values)
          {
            var typedObject = (T)value.Object;

            if (typedSubscription.Query == null || typedSubscription.Query.Invoke(typedObject))
            {
              var newUrl = new UrlSubscriptionResults
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

    public static void AddUser<T>(UrlSubscription<T> user)
    {
      //attempt to get type subscription
      SubscriptionsByType subscriptionsByUser;
      SubscriptionsByType.TryGetValue(typeof(T), out subscriptionsByUser);

      //if unable to get attempt to add
      if (subscriptionsByUser == null)
      {
        subscriptionsByUser = new SubscriptionsByType()
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
      SubscriptionsByUser subscriptionsByUrl;
      subscriptionsByUser.SubscriptionsByUser.TryGetValue(user.ConnectionId, out subscriptionsByUrl);

      //if unable to get attempt to add
      if(subscriptionsByUrl == null)
      {
        subscriptionsByUrl = new SubscriptionsByUser()
        {
          SubscriptionType = typeof(T)
        };

        //add new type subscription
        var wasAdded = subscriptionsByUser.SubscriptionsByUser.TryAdd(user.ConnectionId, subscriptionsByUrl);

        //if add failed then likely another thread was adding at the same time, try again
        if (!wasAdded)
        {
          AddUser<T>(user);
          return;
        }
      }

      //add or update value with new value
      subscriptionsByUrl.SubscriptionsByUrl.AddOrUpdate(user.Url, user, (key, oldValue) => oldValue = user);
    }

    public static void RemoveUrlSubscription(string connectionId, string url)
    {
      foreach (var typeSubscription in SubscriptionsByType)
      {
        if (typeSubscription.Value == null)
        {
          continue;
        }

        SubscriptionsByUser userSubscription;
        typeSubscription.Value.SubscriptionsByUser.TryGetValue(connectionId, out userSubscription);
        if (userSubscription != null)
        {
          userSubscription.SubscriptionsByUrl.TryRemove(url, out _);
        }
      }
    }

    public static async Task RemoveConnection(string connectionId)
    {
      foreach (var typeSubscription in SubscriptionsByType)
      {
        if(typeSubscription.Value == null)
        {
          continue;
        }

        if (typeSubscription.Value.SubscriptionsByUser.ContainsKey(connectionId))
        {
          var removesuccess = typeSubscription.Value.SubscriptionsByUser.TryRemove(connectionId, out _);
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
}
