using System.Threading.Tasks;

namespace EntitySignal.Models
{
  public interface IEntitySignalHubClient
  {
    Task Sync(UserSubscriptionResult data);
    Task ConnectionIdChanged(string newConnectionId);
  }
}
