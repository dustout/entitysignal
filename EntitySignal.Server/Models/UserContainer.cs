using System;

namespace EntitySignal.Hubs
{
  public class UserContainer<T> : IUserContainer
  {
    public string ConnectionId { get; set; }
    public string Url { get; set; }
    public Func<T, bool> Query { get; set; }
  }
}
