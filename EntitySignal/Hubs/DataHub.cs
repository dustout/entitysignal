using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
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
    Task Sync(IEnumerable<DataContainer> data, string url);
  }

  public class UserContainer<T>: IUserContainer
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
    public string Url;
    public List<DataContainer> Data = new List<DataContainer>();
  }

  public class DataSync
  {
    public static ConcurrentDictionary<Type, Object> TypeDictionary { get; set; } = new ConcurrentDictionary<Type, Object>();


    public static List<UserContainer<T>> DictionaryValueToUserContainerList<T>(object obj)
    {
      if (obj.GetType() == typeof(List<UserContainer<T>>))
      {
        var typedList = (List<UserContainer<T>>)obj;
        return typedList;
      }

      return null;
    }

    public static List<UserContainerResult> GetSubscribed<T>(List<UserContainer<T>> userContainers, List<DataContainer> values)
    {
      var results = new List<UserContainerResult>();

      foreach (var user in userContainers)
      {
        var userResults = new UserContainerResult
        {
          ConnectionId = user.ConnectionId,
          Url = user.Url
        };

        foreach (var value in values)
        {
          var typedObject = (T)value.Object;

          if (user.Query == null || user.Query.Invoke(typedObject))
          {
            userResults.Data.Add(value);
          }
        }

        if (userResults.Data.Any())
        {
          results.Add(userResults);
        }
      }

      return results;
    }


    public static void AddUser<T>(UserContainer<T> user)
    {
      if (TypeDictionary.ContainsKey(typeof(T)) == false)
      {
        var newList = new List<UserContainer<T>>();
        TypeDictionary.TryAdd(typeof(T), newList);
      }

      var list = TypeDictionary[typeof(T)];
      var typedList = DictionaryValueToUserContainerList<T>(list);
      if (typedList != null)
      {
        typedList.Add(user);
      }
    }

    public static void RemoveConnectionsFromList<T>(List<UserContainer<T>> userContainers, string connectionId)
    {
      userContainers
        .RemoveAll(x=>x.ConnectionId == connectionId);
    }

    public static void RemoveConnection(string connectionId)
    {
      foreach (var key in TypeDictionary.Keys)
      {
        var value = TypeDictionary[key];

        var method = typeof(DataSync).GetMethod("RemoveConnectionsFromList");
        var genericMethod = method.MakeGenericMethod(new[] { key });
        var subscribedUsers = (IEnumerable<UserContainerResult>)genericMethod.Invoke(null, new[] { value, connectionId});
      }
    }
  }

  public class DataHub : Hub<IDataClient>
  {
    public override async Task OnDisconnectedAsync(Exception exception)
    {
      DataSync.RemoveConnection(Context.ConnectionId);
      await base.OnDisconnectedAsync(exception);
    }

  }
}
