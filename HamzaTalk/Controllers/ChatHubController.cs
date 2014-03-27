using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading;
using System.Web.Http;
using ChatR.Models;
using HamzaTalk.Hubs;
using Microsoft.AspNet.Identity;

namespace HamzaTalk.Controllers
{
    [Authorize]
    public class ChatHubController : ApiControllerWithHub<ChatHub, MyConnection>
    {
        private static volatile List<ChatMessage> _messages = new List<ChatMessage>();
        private static int _lastId = _messages.Any() ? _messages.Max(tdi => tdi.Id) : 0;

        // GET api/<controller>
        public IEnumerable<ChatMessage> Get()
        {
            lock (_messages)
            {
                return _messages.OrderByDescending(x=> x.Id).Take(50).OrderBy(x=> x.Id);
            }
        }

        [Route("chat/get/{id}")]
        // GET api/<controller>/5
        public string Get(int id)
        {
            return "value";
        }

        // POST api/<controller>
        [HttpPost]
        public HttpResponseMessage Post([FromBody]ChatMessageDto message)
        {
            lock (_messages)
            {
                // Add item to the "database"
                var newMessage = new ChatMessage
                {
                    Id = Interlocked.Increment(ref _lastId),
                    ConnectionId = message.ConnectionId,
                    UserName = Thread.CurrentPrincipal.Identity.GetUserName(),
                    SentTime = DateTime.Now.ToShortTimeString(),
                    Message = message.Message
                };
                _messages.Add(newMessage);

                // Notify the connected clients
                Hub.Clients.All.addItem(newMessage);

                // Return the new item, inside a 201 response
                var response = Request.CreateResponse(HttpStatusCode.Created, message);
                string link = Url.Link("apiRoute", new { controller = "Home" });
                response.Headers.Location = new Uri(link);
                return response;
            }
        }

        [HttpPost]
        [Route("api/chat/broadcastTyping/{connectionId}")]
        public void BroadcastTyping(string connectionId)
        {
            var typingInfo = new {Typing = true, Typer = String.Format("{0} isimli hamza yazıyor..",Thread.CurrentPrincipal.Identity.GetUserName())};
            Hub.Clients.AllExcept(connectionId).typing(typingInfo);
        }

        // PUT api/<controller>/5
        public void Put(int id, [FromBody]string value)
        {
        }

        // DELETE api/<controller>/5
        public void Delete(int id)
        {
        }

        public string GetUserName()
        {
            return Thread.CurrentPrincipal.Identity.GetUserName();
        }
    }

    public class ChatMessageDto
    {
        public string Message { get; set; }
        public string ConnectionId { get; set; }
    }
}
