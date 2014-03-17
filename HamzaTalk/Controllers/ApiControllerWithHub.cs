using System;
using System.Web.Http;
using Microsoft.AspNet.SignalR;
using Microsoft.AspNet.SignalR.Hubs;

namespace HamzaTalk.Controllers
{
    public abstract class ApiControllerWithHub<THub> : ApiController where THub : IHub
    {
        private readonly Lazy<IHubContext> _hub =
            new Lazy<IHubContext>(() => GlobalHost.ConnectionManager.GetHubContext<THub>());

        protected IHubContext Hub
        {
            get
            {
                return _hub.Value;
            }
        }
    }
}