using System;
using System.Collections.Concurrent;

namespace EntitySignal.Models
{
  public class SubscriptionsByUrl
  {
    public ConcurrentDictionary<string, IUserSubscription> ByUrl = new ConcurrentDictionary<string, IUserSubscription>();
    public Type SubscriptionType;
  }
}
