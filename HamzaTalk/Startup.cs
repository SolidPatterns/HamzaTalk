using Microsoft.Owin;
using Owin;

[assembly: OwinStartupAttribute(typeof(HamzaTalk.Startup))]
namespace HamzaTalk
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            ConfigureAuth(app);
            app.MapSignalR();
        }
    }
}
