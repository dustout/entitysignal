using System;

namespace EntitySignal.Models
{
  public class UrlSubscription<T> : IURLSubscription
  {
    public string ConnectionId { get; set; }
    public string Url { get; set; }
    public Func<T, bool> Query { get; set; }
  }
}
