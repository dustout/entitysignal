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

  public class UserContainer
  {
    public string ConnectionId;
    public string Url;
    public IQueryable Query;
  }

  public class DataSync
  {
    public static Dictionary<Type, List<UserContainer>> TypeDictionary { get; set; } = new Dictionary<Type, List<UserContainer>>();

    public static void AddUser(Type type, UserContainer user)
    {
      if (TypeDictionary.ContainsKey(type) == false)
      {
        TypeDictionary.Add(type, new List<UserContainer>());
      }

      var list = TypeDictionary[type];
      list.Add(user);
    }
  }


  public class DataHub : Hub<IDataClient>
  {
    public override async Task OnDisconnectedAsync(Exception exception)
    {
      //DataSync.Users.RemoveAll(x => x.ConnectionId == Context.ConnectionId);

      await base.OnDisconnectedAsync(exception);
    }

  }
}
