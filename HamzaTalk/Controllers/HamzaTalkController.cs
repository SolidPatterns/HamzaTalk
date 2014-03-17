using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace HamzaTalk.Controllers
{
    [Authorize]
    public class HamzaTalkController : Controller
    {
        //
        // GET: /Chat/
        public ActionResult Index()
        {
            return View();
        }
	}
}