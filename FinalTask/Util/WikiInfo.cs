using Newtonsoft.Json.Linq;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Net;
using System.Text.RegularExpressions;

namespace FinalTask.Util
{
    public class WikiInfo
    {
        private static string link = ConfigurationManager.AppSettings.Get("link");
        private static string queryAction = ConfigurationManager.AppSettings.Get("queryAction");
        private static string format = ConfigurationManager.AppSettings.Get("format");
        private static string titles = ConfigurationManager.AppSettings.Get("titles");
        private static string parseAction = ConfigurationManager.AppSettings.Get("parseAction");
        private static string contentModel = ConfigurationManager.AppSettings.Get("contentModel");
        private static string pageID = ConfigurationManager.AppSettings.Get("pageID");
        private static string prop = ConfigurationManager.AppSettings.Get("prop");
        private static string exintro = ConfigurationManager.AppSettings.Get("exintro");
        private static string redirect = ConfigurationManager.AppSettings.Get("redirect");
        private static string linkW = ConfigurationManager.AppSettings.Get("linkWiki");
        private static string exsentences = ConfigurationManager.AppSettings.Get("exsentences");

        private static JObject GetWikiResponse(string link, string s)
        {
            HttpWebRequest myRequest = (HttpWebRequest)WebRequest.Create(link + s);
            using (HttpWebResponse response = (HttpWebResponse)myRequest.GetResponse())
            {
                string responseText;
                using (StreamReader reader = new StreamReader(response.GetResponseStream()))
                {
                    responseText = reader.ReadToEnd();
                    JObject token = JObject.Parse(responseText);
                    return token;
                }
            }
        }

        private static string GetWikiPadeID(string town)
        {
            string linkPageID = link + "?" + queryAction + "&" + format + "&" + redirect + "&" + titles;
            JObject token = GetWikiResponse(linkPageID, town.Replace("'", ""));
            JObject inner = token["query"]["pages"].Value<JObject>();
            List<string> keys = inner.Properties().Select(p => p.Name).ToList();
            return keys[0];
        }

        public static string GetWikiImage(string town)
        {
            string linkImage = link + "?" + parseAction + "&" + format + "&" + contentModel + "&" + pageID;
            JObject token = GetWikiResponse(linkImage, GetWikiPadeID(town.Replace("'", "")));
            string pattern = @"\b.*(\.jpg|\.JPG)";
            Regex rgx = new Regex(pattern);
            string inner = token["parse"]["images"].Select(c => (string)c).Where(c => rgx.IsMatch(c)).OrderBy(c => c).ToList()[0];
            string imgSorce = ConfigurationManager.AppSettings.Get("imagePath") + inner;
            string linkImageToUse = "<img src = \"" + imgSorce + "\" alt = \"Wikipedia image\" width = \"235\">";
            return linkImageToUse;
        }

        public static string GetWikiText(string town)
        {
            string linkText = link + "?" + queryAction + "&" + format + "&" + prop + "&" + exsentences + "&" + redirect + "&" + exintro + "&" + titles;
            JObject token = GetWikiResponse(linkText, town.Replace("'", ""));
            string inner = token["query"]["pages"][GetWikiPadeID(town.Replace("'", ""))]["extract"].Value<string>();
            return inner + "<a href=\"" + linkW + town + "\">Wikipedia</a>";
        }
    }
}