using System.Collections.Generic;

namespace EntitySignal.Models
{
  public class UserContainerResult
  {
    public string ConnectionId;
    public List<UserUrlSubscriptions> Urls = new List<UserUrlSubscriptions>();
  }
}
