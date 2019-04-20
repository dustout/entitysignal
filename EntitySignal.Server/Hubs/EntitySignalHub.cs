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
    public async Task DeSyncFrom(string url)
    {
      EntitySignalDataStore.RemoveUrlSubscription(Context.ConnectionId, url);
    }

    public override async Task OnDisconnectedAsync(Exception exception)
    {
      await EntitySignalDataStore.RemoveConnection(Context.ConnectionId);
      await base.OnDisconnectedAsync(exception);
    }

  }
}
