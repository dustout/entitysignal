namespace EntitySignal.Client.Models
{
    public class EntitySignalOptions
    {
        public bool AutoReconnect { get; set; } = true;
        public int ReconnectMinTime { get; set; } = 4000;
        public int ReconnectVariance { get; set; } = 3000;
        public bool Debug { get; set; } = false;
        public bool SuppressInternalDataProcessing { get; set; } = false;
        public string HubUrl { get; set; } = "/dataHub";
        public int MaxWaitForConnectionId { get; set; } = 5000;
        public bool ReturnDeepCopy { get; set; } = false;
        public string DefaultId { get; set; } = "id";
        public string DefaultIdAlt { get; set; } = "Id";
    }
}
