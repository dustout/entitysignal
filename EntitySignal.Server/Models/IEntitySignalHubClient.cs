using System.Threading.Tasks;

namespace EntitySignal.Models
{
  public interface IEntitySignalHubClient
  {
    Task Sync(UserSubscriptionResult data);
  }
}
