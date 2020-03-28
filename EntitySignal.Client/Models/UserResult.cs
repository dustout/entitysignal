using System.Collections.Generic;

namespace EntitySignal.Client.Models
{
    public class UserResult
    {
        public string ConnectionId { get; set; }
        public List<UserUrlResult> Urls { get; set; }
    }
}
