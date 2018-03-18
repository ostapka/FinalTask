using FinalTask.Models;
using FinalTask.Util;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Web.Mvc;

namespace FinalTask.Controllers
{
    public class HomeController : Controller
    {
        TownContext db = new TownContext();

        [HttpGet]
        public ActionResult Index()
        {
            return View();
        }

        [HttpPost]
        public JsonResult Edit(List<Town> towns)
        {
            for (var i = 0; i < towns.Count; i++)
            {
                Town town = db.Towns.Find(towns[i].Id);
                town.Visited = towns[i].Visited;
                db.Entry(town).State = EntityState.Modified;
                db.SaveChanges();
                Dispose(true);
            }
            return Json("Server gets data");
        }

        [HttpPost]
        public JsonResult Add(List<Town> towns)
        {
            for (var i = 0; i < towns.Count; i++)
            {
                if (towns[i] != null)
                {
                    towns[i].WikiInfo = Util.WikiInfo.GetWikiText(towns[i].Name);
                    towns[i].WikiImage = Util.WikiInfo.GetWikiImage(towns[i].Name);
                    db.Towns.Add(towns[i]);
                    db.SaveChanges();
                    Dispose(true);
                }
            }
            return Json("Server gets data");
        }

        public IList<Town> GetTowns()
        {
            var townsList = db.Towns.Select(c => c).Where(c => !c.Visited).ToList();
            Dispose(true);
            return townsList;
        }

        public IList<Town> GetVisitedTowns()
        {
            var townsList = db.Towns.Select(c => c).Where(c => c.Visited).ToList();
            Dispose(true);
            return townsList;
        }

        [HttpGet]
        public JsonResult GetCoordinate()
        {
            var towns = db.Towns.Select(c => c).Where(c => !c.Visited);
            var coordsList = towns.Select(c => new Coordinate { CoordLat = c.CoordLat, CoordLng = c.CoordLng }).ToList();
            Dispose(true);
            return Json(coordsList, JsonRequestBehavior.AllowGet);
        }

        [HttpGet]
        public JsonResult GetVisitedCoordinate()
        {
            var towns = db.Towns.Select(c => c).Where(c => c.Visited);
            var coordsList = towns.Select(c => new Coordinate { CoordLat = c.CoordLat, CoordLng = c.CoordLng }).ToList();
            Dispose(true);
            return Json(coordsList, JsonRequestBehavior.AllowGet);
        }

        public ActionResult Partial()
        {
            return PartialView();
        }

        public ActionResult PartialVisited()
        {
            return PartialView();
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }
    }
}