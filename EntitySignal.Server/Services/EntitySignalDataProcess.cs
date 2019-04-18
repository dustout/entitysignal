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
    private readonly IHubContext<EntitySignalHub, IEntitySignalHubClient> _dataHubContext;

    public EntitySignalDataProcess(
      IHubContext<EntitySignalHub, IEntitySignalHubClient> dataHubContext
      )
    {
      _dataHubContext = dataHubContext;
    }

    public ChangedObjectsContainer PreSave(ChangeTracker changeTracker)
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
            .Select(x => new ChangedObject
            {
              IdField = "id",
              Object = x.Entity,
              State = x.State,
              Type = x.Entity.GetType()
            })
            .ToList();

        var changedDataContainer = new ChangedObjectsContainer()
        {
          ChangedObjects = changedData
        };

        return changedDataContainer;
      }

      return null;
    }

    public void PostSave(ChangedObjectsContainer changedData)
    {
      PostSaveAsync(changedData).Wait();
    }

    public async Task PostSaveAsync(ChangedObjectsContainer changedData)
    {
      var changedByType = changedData.ChangedObjects
        .GroupBy(x => x.Type)
        .ToList();

      var pendingTasks = new List<Task>();

      foreach (var typeGroup in changedByType)
      {
        var queryableTypeGroup = typeGroup
          .ToList();

        SubscriptionsByType subscriptionsByType;
        EntitySignalDataStore.SubscriptionsByType.TryGetValue(typeGroup.Key, out subscriptionsByType);

        if (subscriptionsByType != null)
        {
          var method = typeof(EntitySignalDataStore).GetMethod("GetSubscribed");
          var genericMethod = method.MakeGenericMethod(new[] { typeGroup.Key });
          var subscribedUsers = (IEnumerable<UserSubscriptionResult>)genericMethod.Invoke(null, new Object[] { subscriptionsByType, queryableTypeGroup });

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
