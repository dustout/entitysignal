using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using EntitySignal.Hubs;
using EntitySignal.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace EntitySignal.Data
{
  public class ApplicationDbContext : IdentityDbContext
  {
    public IHubContext<DataHub, IDataClient> _dataHubContext { get; }

    public DbSet<Messages> Messages { get; set; }
    public DbSet<Jokes> Jokes { get; set; }

    public ApplicationDbContext(
      DbContextOptions<ApplicationDbContext> options,
      IHubContext<DataHub, IDataClient> dataHubContext
      )
        : base(options)
    {
      _dataHubContext = dataHubContext;
    }

    public override int SaveChanges()
    {
      var changedData = PreSave();
      var result = base.SaveChanges();
      PostSave(changedData).RunSynchronously();
      return result;
    }

    public IEnumerable<DataContainer> PreSave()
    {
      if (ChangeTracker == null)
      {
        return null;
      }

      var changedObjects = this.ChangeTracker
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

    public async Task PostSave(IEnumerable<DataContainer> changedData)
    {
      var changedByType = changedData
        .GroupBy(x => x.Type)
        .ToList();

      foreach (var typeGroup in changedByType)
      {
        var queryableTypeGroup = typeGroup
          .ToList();

        SubscriptionsByUser subscriptionsByType;
        DataSync.SubscriptionsByType.TryGetValue(typeGroup.Key, out subscriptionsByType);

        if (subscriptionsByType != null)
        {
          var method = typeof(DataSync).GetMethod("GetSubscribed");
          var genericMethod = method.MakeGenericMethod(new[] { typeGroup.Key });
          var subscribedUsers = (IEnumerable<UserContainerResult>)genericMethod.Invoke(null, new Object[] { subscriptionsByType, queryableTypeGroup});

          foreach (var subscribedUser in subscribedUsers)
          {
            if(subscribedUser.ConnectionId == null)
            {
              return;
            }

            await _dataHubContext.Clients.Client(subscribedUser.ConnectionId).Sync(subscribedUser);
          }
        }
      }
    }

    public override async Task<int> SaveChangesAsync(bool acceptAllChangesOnSuccess, CancellationToken cancellationToken = default(CancellationToken))
    {
      var changedData = PreSave();
      var result = await base.SaveChangesAsync(acceptAllChangesOnSuccess, cancellationToken);
      await PostSave(changedData);
      return result;
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default(CancellationToken))
    {
      return base.SaveChangesAsync(cancellationToken: cancellationToken);
    }
  }
}
