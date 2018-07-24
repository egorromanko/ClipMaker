using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace ClipMaker.API.Controllers
{
    [Route("api/[controller]")]
    public class ClipMakerController : Controller
    {
        private const string KeywordsUrl = "http://172.18.137.201:5000/summary";
        private const string DownloadUrl = "http://172.18.137.201:5000/download?url={0}";
        private const string BeatsUrl = "http://172.18.137.201:5000/beat?url={0}&count={1}";
        private readonly IHostingEnvironment hostingEnvironment;

        public ClipMakerController(IHostingEnvironment hostingEnvironment)
        {
            this.hostingEnvironment = hostingEnvironment;
        }

        [HttpPost]
        [Route("Recognize")]
        public IActionResult Post()
        {
            if (Request.Form.Files.Count == 0)
            {
                return BadRequest();
            }

            string result;
            using (var fs = Request.Form.Files[0].OpenReadStream())
            {
                using (BinaryReader reader = new BinaryReader(fs))
                {
                    byte[] datas = reader.ReadBytes((int)fs.Length);
                    result = IdentifyProtocolV1.recognize("identify-eu-west-1.acrcloud.com", "36c7a45f5e6a518428e70cf3b1aaa2c2", "vFaHiD3Npcgzm40nqM1hXaOquu7dEBdBZTJn3e2h", datas, "audio");
                }
            }

            return Ok(JsonConvert.DeserializeObject(result));
        }

        [HttpPost]
        [Route("CreateClip")]
        public async Task<IActionResult> CreateClip([FromBody]ClipData clipData)
        {
            using (var httpClient = new HttpClient())
            {
                var content = new StringContent(JsonConvert.SerializeObject(new { text = clipData.Lyrics }), Encoding.UTF8, "application/json");
                var response = await httpClient.PostAsync(KeywordsUrl, content);
                var respString = await response.Content.ReadAsStringAsync();
                var words = JsonConvert.DeserializeObject<List<string>>(respString);
                var resultingImages = new List<string>();
                foreach (var word in words)
                {
                    var resp = await httpClient.GetAsync($"https://api.flickr.com/services/rest?method=flickr.photos.search&api_key=0036a2e2148e9efd5410b7072c4dadd2&format=json&text={word}");
                    var respContent = await resp.Content.ReadAsStringAsync();
                    respContent = respContent.TrimEnd(')').Replace("jsonFlickrApi(", string.Empty);
                    JObject result = JsonConvert.DeserializeObject<JObject>(respContent);
                    var length = result.First.First.Last.First.Count();
                    var random = new Random().Next(1, length);
                    var photo = result.First.First.Last.First[random - 1];
                    resultingImages.Add(photo["id"].ToString());
                }

                var musicFileResponse = await httpClient.GetAsync(string.Format(DownloadUrl, clipData.YoutubeLink));
                var musicPath = Guid.NewGuid().ToString() + ".mp3";
                using (var contentStream = await musicFileResponse.Content.ReadAsStreamAsync())
                {
                    using (var musicStream = new FileStream(musicPath, FileMode.Create, FileAccess.Write, FileShare.None, 3145728, true))
                    {
                        await contentStream.CopyToAsync(musicStream);
                    }
                }

                var beatResponse = await httpClient.GetAsync(string.Format(BeatsUrl, clipData.YoutubeLink, resultingImages.Count));
                var beats = JsonConvert.DeserializeObject<double[]>(JsonConvert.DeserializeObject<JObject>(await beatResponse.Content.ReadAsStringAsync())["beats"].ToString());
                var imagePaths = new List<string>();
                foreach (var imageId in resultingImages)
                {
                    var resp = await httpClient.GetAsync($"https://api.flickr.com/services/rest?method=flickr.photos.getSizes&api_key=0036a2e2148e9efd5410b7072c4dadd2&format=json&photo_id={imageId}");
                    var respContent = await resp.Content.ReadAsStringAsync();
                    respContent = respContent.TrimEnd(')').Replace("jsonFlickrApi(", string.Empty);

                    var imageUrl = JsonConvert.DeserializeObject<JObject>(respContent)["sizes"].Last.Last.Last["source"].ToString();
                    var filePath = Path.Combine(hostingEnvironment.WebRootPath, "images", Guid.NewGuid().ToString() + ".png");

                    using (Stream contentStream = await (await httpClient.GetAsync(imageUrl)).Content.ReadAsStreamAsync(), stream = new FileStream(filePath, FileMode.Create, FileAccess.Write, FileShare.None, 3145728, true))
                    {
                        await contentStream.CopyToAsync(stream);
                    }

                    imagePaths.Add(filePath);
                }

                var builder = new StringBuilder();
                for (int i = 0; i < beats.Count(); i++)
                {
                    try
                    {
                        builder.Append($" -t {beats[i].ToString().Replace(',', '.')} -i {imagePaths[i]}");
                    }
                    catch (Exception ex)
                    {
                        // Do nothing
                    }
                }

                try
                {
                    var videoName = Guid.NewGuid().ToString() + ".mp4";
                    builder.Append($" -i {musicPath} -codec copy -shortest -c:v libx264 -vf fps=25 -pix_fmt yuv420p -vf scale = 640:480 { videoName}");
                    var parameters = builder.ToString();

                    var ffmpegPath = Path.Combine(hostingEnvironment.WebRootPath, "videos\\ffmpeg.exe");
                    var process = Process.Start(new ProcessStartInfo(ffmpegPath, parameters));
                    process.OutputDataReceived += Process_OutputDataReceived;
                    process.Start();
                    process.WaitForExit();
                }
                catch (Exception ex)
                {

                    throw;
                }
                
            }

            return Ok(clipData);
        }

        private void Process_OutputDataReceived(object sender, DataReceivedEventArgs e)
        {
            Debug.WriteLine(e.Data);
        }
    }

    public class ClipData
    {
        public string Lyrics { get; set; }
        public string YoutubeLink { get; set; }
    }

    public class IdentifyProtocolV1
    {
        public static string postHttp(string url, IDictionary<string, Object> postParams, int timeout)
        {
            string result = "";

            string BOUNDARYSTR = "acrcloud***copyright***2015***" + DateTime.Now.Ticks.ToString("x");
            string BOUNDARY = "--" + BOUNDARYSTR + "\r\n";
            var ENDBOUNDARY = Encoding.ASCII.GetBytes("--" + BOUNDARYSTR + "--\r\n\r\n");

            var stringKeyHeader = BOUNDARY +
                           "Content-Disposition: form-data; name=\"{0}\"" +
                           "\r\n\r\n{1}\r\n";
            var filePartHeader = BOUNDARY +
                            "Content-Disposition: form-data; name=\"{0}\"; filename=\"{1}\"\r\n" +
                            "Content-Type: application/octet-stream\r\n\r\n";

            var memStream = new MemoryStream();
            foreach (var item in postParams)
            {
                if (item.Value is string)
                {
                    string tmpStr = string.Format(stringKeyHeader, item.Key, item.Value);
                    byte[] tmpBytes = Encoding.UTF8.GetBytes(tmpStr);
                    memStream.Write(tmpBytes, 0, tmpBytes.Length);
                }
                else if (item.Value is byte[])
                {
                    var header = string.Format(filePartHeader, "sample", "sample");
                    var headerbytes = Encoding.UTF8.GetBytes(header);
                    memStream.Write(headerbytes, 0, headerbytes.Length);
                    byte[] sample = (byte[])item.Value;
                    memStream.Write(sample, 0, sample.Length);
                    memStream.Write(Encoding.UTF8.GetBytes("\r\n"), 0, 2);
                }
            }
            memStream.Write(ENDBOUNDARY, 0, ENDBOUNDARY.Length);

            HttpWebRequest request = null;
            HttpWebResponse response = null;
            Stream writer = null;
            StreamReader myReader = null;
            try
            {
                request = (HttpWebRequest)WebRequest.Create(url);
                request.Timeout = timeout;
                request.Method = "POST";
                request.ContentType = "multipart/form-data; boundary=" + BOUNDARYSTR;

                memStream.Position = 0;
                byte[] tempBuffer = new byte[memStream.Length];
                memStream.Read(tempBuffer, 0, tempBuffer.Length);

                writer = request.GetRequestStream();
                writer.Write(tempBuffer, 0, tempBuffer.Length);
                writer.Close();
                writer = null;

                response = (HttpWebResponse)request.GetResponse();
                myReader = new StreamReader(response.GetResponseStream(), Encoding.UTF8);
                result = myReader.ReadToEnd();
            }
            catch (WebException e)
            {
                Debug.WriteLine("timeout:\n" + e.ToString());
            }
            catch (Exception e)
            {
                Debug.WriteLine("other excption:" + e.ToString());
            }
            finally
            {
                if (memStream != null)
                {
                    memStream.Close();
                    memStream = null;
                }
                if (writer != null)
                {
                    writer.Close();
                    writer = null;
                }
                if (myReader != null)
                {
                    myReader.Close();
                    myReader = null;
                }
                if (request != null)
                {
                    request.Abort();
                    request = null;
                }
                if (response != null)
                {
                    response.Close();
                    response = null;
                }
            }

            return result;
        }

        public static string encryptByHMACSHA1(string input, string key)
        {
            HMACSHA1 hmac = new HMACSHA1(System.Text.Encoding.UTF8.GetBytes(key));
            byte[] stringBytes = Encoding.UTF8.GetBytes(input);
            byte[] hashedValue = hmac.ComputeHash(stringBytes);
            return encodeToBase64(hashedValue);
        }

        public static string encodeToBase64(byte[] input)
        {
            string res = Convert.ToBase64String(input, 0, input.Length);
            return res;
        }

        public static string recognize(string host, string accessKey, string secretKey, byte[] queryData, string queryType, int timeout = 8000)
        {
            string method = "POST";
            string httpURL = "/v1/identify";
            string dataType = queryType;
            string sigVersion = "1";
            string timestamp = ((int)DateTime.UtcNow.Subtract(new DateTime(1970, 1, 1, 0, 0, 0, DateTimeKind.Utc)).TotalSeconds).ToString();

            string reqURL = "http://" + host + httpURL;

            string sigStr = method + "\n" + httpURL + "\n" + accessKey + "\n" + dataType + "\n" + sigVersion + "\n" + timestamp;
            string signature = encryptByHMACSHA1(sigStr, secretKey);

            var dict = new Dictionary<string, object>();
            dict.Add("access_key", accessKey);
            dict.Add("sample_bytes", queryData.Length.ToString());
            dict.Add("sample", queryData);
            dict.Add("timestamp", timestamp);
            dict.Add("signature", signature);
            dict.Add("data_type", queryType);
            dict.Add("signature_version", sigVersion);

            string res = postHttp(reqURL, dict, timeout);

            return res;
        }
    }
}
