using EntitySignal.Hubs;
using EntitySignal.Services;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;

namespace EntitySignal.Extensions
{
  public static class EntitySignalExtensions
  {
    public static IServiceCollection AddEntitySignal(this IServiceCollection services)
    {
      services.AddTransient<EntitySignalSubscribe>();
      services.AddSingleton<EntitySignalDataProcess>();

      return services;
    }
  }
}
