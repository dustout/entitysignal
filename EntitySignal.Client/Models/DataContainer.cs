using EntitySignal.Client.Enums;

namespace EntitySignal.Client.Models
{
  public class DataContainer<T>
  {
    public string Type { get; set; }
    public string Id { get; set; }
    public T Object { get; set; }
    public EntityState State { get; set; }
  }
}
