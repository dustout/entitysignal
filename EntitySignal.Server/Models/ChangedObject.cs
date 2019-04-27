using Microsoft.EntityFrameworkCore;
using System;

namespace EntitySignal.Models
{
  public class ChangedObject
  {
    public Type Type { get; set; }
    public object Object { get; set; }
    public EntityState State { get; set; }
    public string Url { get; set; }
  }
}
