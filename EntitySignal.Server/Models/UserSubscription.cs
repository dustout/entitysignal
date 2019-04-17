using System;

namespace EntitySignal.Models
{
  public class UserSubscription<T> : IUserSubscription
  {
    public string ConnectionId { get; set; }
    public string Url { get; set; }
    public Func<T, bool> Query { get; set; }
  }
}
