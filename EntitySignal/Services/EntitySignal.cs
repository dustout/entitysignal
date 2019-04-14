using EntitySignal.Hubs;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.SignalR;
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


  public class EntitySignal
  {
  }
}
