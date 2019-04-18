using System.Collections.Generic;

namespace EntitySignal.Models
{
  public class UserSubscriptionResult
  {
    public string ConnectionId;
    public List<UrlSubscriptionResults> Urls = new List<UrlSubscriptionResults>();
  }
}
