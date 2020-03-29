using Newtonsoft.Json.Linq;
using System.Collections.Generic;

namespace EntitySignal.Client.Models
{
  public class UserUrlResult
  {
    public string Url { get; set; }
    public List<DataContainer<JToken>> Data { get; set; }
  }
}
