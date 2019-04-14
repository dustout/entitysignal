using System.Threading.Tasks;

namespace EntitySignal.Hubs
{
  public interface IDataClient
  {
    Task Sync(UserContainerResult data);
  }
}
