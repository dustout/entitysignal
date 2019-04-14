using System;
using System.Collections.Concurrent;

namespace EntitySignal.Hubs
{
  public class SubscriptionsByUser
  {
    public ConcurrentDictionary<string, SubscriptionsByUrl> ByUser = new ConcurrentDictionary<string, SubscriptionsByUrl>();
    public Type SubscriptionType;
  }
}
