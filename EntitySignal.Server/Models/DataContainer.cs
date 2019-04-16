using Microsoft.EntityFrameworkCore;
using System;

namespace EntitySignal.Models
{
  public class DataContainer
  {
    public Type Type { get; set; }
    public string IdField { get; set; }
    public object Object { get; set; }
    public EntityState State { get; set; }
    public string Url { get; set; }
  }
}
