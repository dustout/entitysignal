using System;
using System.Collections.Generic;
using System.Text;

namespace EntitySignal.Client.Extensions
{
    public static class DictionaryExtensions
    {
        public static void ForEach<TKey, TValue>(this Dictionary<TKey, TValue> dictionary, Action<TKey, TValue> action)
        {
            foreach (var item in dictionary)
            {
                action.Invoke(item.Key, item.Value);
            }
        }
    }
}
