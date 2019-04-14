using EntitySignal.Hubs;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace EntitySignal.Services
{
  public static class EntitySignalExtensions
  {
    public static IServiceCollection AddEntitySignal(this IServiceCollection services)
    {
      services.AddSignalR();

      services.AddTransient<EntitySignalSubscribe>();
      services.AddSingleton<EntitySignalDataProcess>();

      return services;
    }

    public static IApplicationBuilder UseEntitySignal(
        this IApplicationBuilder app)
    {
      app.UseWebSockets();

      app.UseSignalR(routes =>
      {
        routes.MapHub<EntitySignalHub>("/dataHub");
      });

      return app;
    }
  }

  public class EntitySignalDataProcess
  {
    public IHubContext<EntitySignalHub, IDataClient> _dataHubContext { get; }

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
        DataSync.SubscriptionsByType.TryGetValue(typeGroup.Key, out subscriptionsByType);

        if (subscriptionsByType != null)
        {
          var method = typeof(DataSync).GetMethod("GetSubscribed");
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

  public class EntitySignalSubscribe
  {
    private readonly IHttpContextAccessor _httpContextAccessor;

    public EntitySignalSubscribe(
      IHttpContextAccessor httpContextAccessor
      )
    {
      _httpContextAccessor = httpContextAccessor;
    }

    public UserContainer<T> Subscribe<T>(string connectionId, Func<T, bool> query = null)
    {
      var url = $"{_httpContextAccessor.HttpContext.Request.Path}{_httpContextAccessor.HttpContext.Request.QueryString}";

      var userContainer = new UserContainer<T>()
      {
        ConnectionId = connectionId,
        Url = url,
        Query = query
      };

      DataSync.AddUser(userContainer);

      return userContainer;
    }

  }
}
