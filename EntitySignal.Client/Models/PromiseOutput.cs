namespace EntitySignal.Client.Models
{
    public struct PromiseOutput<T>
    {
        public PromiseOutput(
            bool succeeded,
            T result = default)
        {
            Succeeded = succeeded;
            Result = result;
        }

        public bool Succeeded { get; set; }
        public T Result { get; set; }
    }

    public struct PromiseOutput<TSuccess, TFail>
    {
        public PromiseOutput(
            bool succeeded,
            TSuccess successResult = default,
            TFail failResult = default)
        {
            Succeeded = succeeded;
            SuccessResult = successResult;
            FailResult = failResult;
        }

        public bool Succeeded { get; set; }
        public TSuccess SuccessResult { get; set; }
        public TFail FailResult { get; set; }
    }
}
