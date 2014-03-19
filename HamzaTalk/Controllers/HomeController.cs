using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace HamzaTalk.Controllers
{
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
            return View();
        }

        public ActionResult About()
        {
            ViewBag.Message = "HamzaTalk description page.";

            return View();
        }

        public ActionResult Contact()
        {
            ViewBag.Message = "HamzaTalk contact page.";

            return View();
        }
    }
}