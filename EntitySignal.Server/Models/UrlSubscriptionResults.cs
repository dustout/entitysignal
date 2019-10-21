using Newtonsoft.Json;
using System.Collections.Generic;

namespace EntitySignal.Models
{
  public class UrlSubscriptionResults
  {
    [JsonProperty("url")]
    public string Url;

    [JsonProperty("data")]
    public List<ChangedObject> Data = new List<ChangedObject>();
  }
}
