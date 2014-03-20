using System;

namespace ChatR.Models
{
    public class ChatMessage
    {
        public int Id { get; set; }
        public string ConnectionId { get; set; }
        public string UserName { get; set; }
        public string SentTime { get; set; }
        public string Message { get; set; }
    }
}