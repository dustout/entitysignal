using Newtonsoft.Json.Linq;
using System;

namespace EntitySignal.Client.Extensions
{
  public static class JArrayExtensions
  {
    public static void ForEach(this JArray jArray, Action<JToken, int> action)
    {
      for (var i = 0; i < jArray.Count; i++)
      {
        action.Invoke(jArray[i], i);
      }
    }
  }
}
