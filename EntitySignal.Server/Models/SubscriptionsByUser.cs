using System;
using System.Collections.Concurrent;

namespace EntitySignal.Models
{
  public class SubscriptionsByUser
  {
    //dictionary of urls subscribed to by this user of this type
    public ConcurrentDictionary<string, IURLSubscription> SubscriptionsByUrl = new ConcurrentDictionary<string, IURLSubscription>();

    public Type SubscriptionType;
  }
}
