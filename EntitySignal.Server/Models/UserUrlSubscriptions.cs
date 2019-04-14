using System.Collections.Generic;

namespace EntitySignal.Hubs
{
  public class UserUrlSubscriptions
  {
    public string Url;
    public List<DataContainer> Data = new List<DataContainer>();
  }
}
