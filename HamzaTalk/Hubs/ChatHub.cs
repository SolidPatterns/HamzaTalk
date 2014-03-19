using Microsoft.Ajax.Utilities;
using Microsoft.AspNet.SignalR;
using Microsoft.AspNet.SignalR.Hubs;

namespace HamzaTalk.Hubs
{
    [HubName("chat")]
    public class ChatHub : Hub
    {
    }
}