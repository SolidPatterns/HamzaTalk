using System;
using System.Web.Http;
using Microsoft.AspNet.SignalR;
using Microsoft.AspNet.SignalR.Hubs;
using Microsoft.AspNet.SignalR.Infrastructure;

namespace HamzaTalk.Controllers
{
    public abstract class ApiControllerWithHub<THub, TConnection> : ApiController
        where THub : IHub
        where TConnection : PersistentConnection
    {
        private readonly Lazy<IHubContext> _hubContext =
            new Lazy<IHubContext>(() => GlobalHost.ConnectionManager.GetHubContext<THub>());

        private readonly Lazy<IPersistentConnectionContext> _persistentConnectionContext =
            new Lazy<IPersistentConnectionContext>(() => GlobalHost.ConnectionManager.GetConnectionContext<TConnection>());

        protected IHubContext Hub
        {
            get { return _hubContext.Value; }
        }

        protected IPersistentConnectionContext PersistentConnectionContext
        {
            get { return _persistentConnectionContext.Value; }
        }

        protected Connection Connection
        {
            get { return (Connection)PersistentConnectionContext.Connection; }
        }
    }

    public class MyConnection : PersistentConnection
    {
        
    }

}