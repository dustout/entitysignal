using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System;
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

    public static UserContainerResult RunFilter<T>(UserContainer<T> userContainer, IQueryable<T> values)
    {
      var result = new UserContainerResult()
      {
        ConnectionId = userContainer.ConnectionId,
        Url = userContainer.Url
      };

      if (userContainer.Query == null)
      {
        return result;
      }

      var isValid = values
        .Where(userContainer.Query)
        .Any();

      if (isValid)
      {
        return result;
      }

      return null;
    }

    public static Dictionary<Type, Object> TypeDictionary { get; set; } = new Dictionary<Type, Object>();

    public static void AddUser<T>(UserContainer<T> user)
    {
      if (TypeDictionary.ContainsKey(typeof(T)) == false)
      {
        var newList = new List<UserContainer<T>>();
        TypeDictionary.Add(typeof(T), newList);
      }

      var list = TypeDictionary[typeof(T)];
      var typedList = DictionaryValueToUserContainerList<T>(list);
      if (typedList != null)
      {
        typedList.Add(user);
      }
    }
  }

  public class DataHub : Hub<IDataClient>
  {
    public override async Task OnDisconnectedAsync(Exception exception)
    {
      foreach (var key in DataSync.TypeDictionary.Keys)
      {

      }

      //DataSync.Users.RemoveAll(x => x.ConnectionId == Context.ConnectionId);

      await base.OnDisconnectedAsync(exception);
    }

  }
}
