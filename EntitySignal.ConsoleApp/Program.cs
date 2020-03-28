using EntitySignal.Client;
using EntitySignal.Client.Enums;
using EntitySignal.Client.Models;
using Newtonsoft.Json;
using System;
using System.Threading.Tasks;

namespace EntitySignal.ConsoleApp
{
    class Program
    {
        private static EntitySignalClient client;
        static void Main(string[] args)
        {
            client = new EntitySignalClient(new Client.Models.EntitySignalOptions
            {
                HubUrl = "https://localhost:44315/dataHub",
                Debug = true,
            });
            StartClient();
            client.OnStatusChanged += OnStatusChanged;
            client.OnSync += OnSync;
            Console.ReadKey();
        }

        private static async void StartClient()
        {
            var result1 = await client.SyncWith("https://localhost:44315/subscribe/SubscribeToAllMessages");
            var result2 = await client.SyncWith("https://localhost:44315/subscribe/SubscribeToOddIdMessages");
            var result3 = await client.SyncWith("https://localhost:44315/subscribe/SubscribeToAllJokes");
            var result4 = await client.SyncWith("https://localhost:44315/subscribe/SubscribeToJokesWithGuidAnswer");

            Console.WriteLine("Messages");
            Console.WriteLine(result1.SuccessResult.ToString(Newtonsoft.Json.Formatting.Indented));
            Console.WriteLine("Messages with odd id");
            Console.WriteLine(result2.SuccessResult.ToString(Newtonsoft.Json.Formatting.Indented));
            Console.WriteLine("Jokes");
            Console.WriteLine(result3.SuccessResult.ToString(Newtonsoft.Json.Formatting.Indented));
            Console.WriteLine("Jokes with guid answer");
            Console.WriteLine(result4.SuccessResult.ToString(Newtonsoft.Json.Formatting.Indented));
        }

        private static async void OnStatusChanged(EntitySignalStatus status)
        {
            Console.WriteLine($"Status: {status}");
        }

        private static async void OnSync(UserResult newData)
        {
          Console.WriteLine(JsonConvert.SerializeObject(newData));
        }
    }
}
