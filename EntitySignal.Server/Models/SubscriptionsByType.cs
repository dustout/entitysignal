using System;
using System.Collections.Concurrent;

namespace EntitySignal.Models
{
  public class SubscriptionsByType
  {
    //dictionary of users that are subscribed to this type
    public ConcurrentDictionary<string, SubscriptionsByUser> SubscriptionsByUser = new ConcurrentDictionary<string, SubscriptionsByUser>();

    public Type SubscriptionType;
  }
}
