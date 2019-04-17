using System.Collections.Generic;

namespace EntitySignal.Models
{
  public class UserUrlSubscriptions
  {
    public string Url;
    public List<ChangedObject> Data = new List<ChangedObject>();
  }
}
