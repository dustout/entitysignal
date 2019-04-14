using System;
using System.Collections.Concurrent;

namespace EntitySignal.Hubs
{
  public class SubscriptionsByUrl
  {
    public ConcurrentDictionary<string, IUserContainer> ByUrl = new ConcurrentDictionary<string, IUserContainer>();
    public Type SubscriptionType;
  }
}
