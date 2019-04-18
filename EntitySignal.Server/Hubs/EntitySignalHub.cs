using EntitySignal.Models;
using EntitySignal.Services;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace EntitySignal.Hubs
{
  public class EntitySignalHub : Hub<IEntitySignalHubClient>
  {
    private static Mutex mut = new Mutex();

    public async Task DeSyncFrom(string url)
    {
      EntitySignalDataStore.RemoveUrlSubscription(Context.ConnectionId, url);
    }

    public override Task OnConnectedAsync()
    {
      mut.WaitOne(10);
      EntitySignalDataStore.ConnectionCount++;
      mut.ReleaseMutex();

      return base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception exception)
    {
      mut.WaitOne(10);
      EntitySignalDataStore.ConnectionCount--;
      mut.ReleaseMutex();

      await EntitySignalDataStore.RemoveConnection(Context.ConnectionId);
      await base.OnDisconnectedAsync(exception);
    }

  }
}
