using System.Collections.Generic;

namespace EntitySignal.Models
{
  public class UrlSubscriptionResults
  {
    public string Url;
    public List<ChangedObject> Data = new List<ChangedObject>();
  }
}
