using Newtonsoft.Json;
using System.Collections.Generic;

namespace EntitySignal.Models
{
  public class UserSubscriptionResult
  {
    [JsonProperty("connectionId")]
    public string ConnectionId;

    [JsonProperty("urls")]
    public List<UrlSubscriptionResults> Urls = new List<UrlSubscriptionResults>();
  }
}
