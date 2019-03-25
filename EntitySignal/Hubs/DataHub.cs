using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace EntitySignal.Hubs
{
  public class DataContainer
  {
    public string Type { get; set; }
    public string IdField { get; set; }
    public object Object { get; set; }
    public EntityState State { get; set; }
  }

  public interface IDataClient
  {
    Task Sync(IEnumerable<DataContainer> data);
  }

  public class DataHub : Hub<IDataClient>
  {
    //public override async Task OnConnectedAsync()
    //{
    //  await Groups.AddToGroupAsync(Context.ConnectionId, "SignalR Users");
    //  await base.OnConnectedAsync();
    //}

    //public override async Task OnDisconnectedAsync(Exception exception)
    //{
    //  await Groups.RemoveFromGroupAsync(Context.ConnectionId, "SignalR Users");
    //  await base.OnDisconnectedAsync(exception);
    //}
  }
}
