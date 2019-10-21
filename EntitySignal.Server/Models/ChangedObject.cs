using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using System;

namespace EntitySignal.Models
{
  public class ChangedObject
  {
    [JsonProperty("type")]
    public Type Type { get; set; }

    [JsonProperty("object")]
    public object Object { get; set; }
    
    [JsonProperty("state")]
    public EntityState State { get; set; }
    
    [JsonProperty("url")]
    public string Url { get; set; }
  }
}
