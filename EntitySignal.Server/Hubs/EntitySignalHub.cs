using Microsoft.AspNetCore.SignalR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace EntitySignal.Hubs
{
  public class EntitySignalHub : Hub<IDataClient>
  {
    private static Mutex mut = new Mutex();

    public override Task OnConnectedAsync()
    {
      mut.WaitOne(100);
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
