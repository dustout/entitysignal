using EntitySignal.Hubs;
using EntitySignal.Models;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace EntitySignal.Services
{
  public class EntitySignalDataProcess
  {
    private readonly IHubContext<EntitySignalHub, IDataClient> _dataHubContext;
   
    public EntitySignalDataProcess(
      IHubContext<EntitySignalHub, IDataClient> dataHubContext
      )
    {
      _dataHubContext = dataHubContext;
    }

    public IEnumerable<DataContainer> PreSave(ChangeTracker changeTracker)
    {
      if (changeTracker == null)
      {
        return null;
      }

      var changedObjects = changeTracker
        .Entries();

      if (changedObjects.Any())
      {

        var changedData = changedObjects
            .Select(x => new DataContainer
            {
              IdField = "id",
              Object = x.Entity,
              State = x.State,
              Type = x.Entity.GetType()
            })
            .ToList();

        return changedData;
      }

      return null;
    }

    public void PostSave(IEnumerable<DataContainer> changedData)
    {
      PostSaveAsync(changedData).RunSynchronously();
    }

    public async Task PostSaveAsync(IEnumerable<DataContainer> changedData)
    {
      var changedByType = changedData
        .GroupBy(x => x.Type)
        .ToList();

      var pendingTasks = new List<Task>();

      foreach (var typeGroup in changedByType)
      {
        var queryableTypeGroup = typeGroup
          .ToList();

        SubscriptionsByUser subscriptionsByType;
        EntitySignalDataStore.SubscriptionsByType.TryGetValue(typeGroup.Key, out subscriptionsByType);

        if (subscriptionsByType != null)
        {
          var method = typeof(EntitySignalDataStore).GetMethod("GetSubscribed");
          var genericMethod = method.MakeGenericMethod(new[] { typeGroup.Key });
          var subscribedUsers = (IEnumerable<UserContainerResult>)genericMethod.Invoke(null, new Object[] { subscriptionsByType, queryableTypeGroup });

          foreach (var subscribedUser in subscribedUsers)
          {
            if (subscribedUser.ConnectionId == null)
            {
              return;
            }

            var newTask = _dataHubContext.Clients.Client(subscribedUser.ConnectionId).Sync(subscribedUser);
            pendingTasks.Add(newTask);
          }
        }
      }

      await Task.WhenAll(pendingTasks);
    }
  }
}
