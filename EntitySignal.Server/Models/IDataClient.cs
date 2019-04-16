using System.Threading.Tasks;

namespace EntitySignal.Models
{
  public interface IDataClient
  {
    Task Sync(UserContainerResult data);
  }
}
