using System;
using System.IO;
using System.Net;
using System.Net.Sockets;
using System.Threading;
using System.Collections.Generic;
using System.Windows.Forms;
using System.Drawing;
using System.Runtime.InteropServices;
using Microsoft.Web.WebView2.WinForms;
using Microsoft.Web.WebView2.Core;

namespace LUMI.Desktop
{
    public class HttpServer
    {
        private HttpListener _listener;
        private readonly string _baseDir;
        private readonly string _distDir;
        private int _port;
        private volatile bool _isRunning;

        private static readonly Dictionary<string, string> MimeTypes = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
        {
            { ".html", "text/html; charset=utf-8" },
            { ".htm", "text/html; charset=utf-8" },
            { ".js", "application/javascript; charset=utf-8" },
            { ".mjs", "application/javascript; charset=utf-8" },
            { ".css", "text/css; charset=utf-8" },
            { ".json", "application/json; charset=utf-8" },
            { ".webmanifest", "application/manifest+json; charset=utf-8" },
            { ".svg", "image/svg+xml" },
            { ".png", "image/png" },
            { ".jpg", "image/jpeg" },
            { ".jpeg", "image/jpeg" },
            { ".gif", "image/gif" },
            { ".ico", "image/x-icon" },
            { ".webp", "image/webp" },
            { ".woff", "font/woff" },
            { ".woff2", "font/woff2" },
            { ".ttf", "font/ttf" },
            { ".eot", "application/vnd.ms-fontobject" },
            { ".pdf", "application/pdf" },
            { ".csv", "text/csv; charset=utf-8" },
            { ".txt", "text/plain; charset=utf-8" },
            { ".md", "text/markdown; charset=utf-8" },
            { ".py", "text/plain; charset=utf-8" },
            { ".xml", "application/xml; charset=utf-8" },
            { ".zip", "application/zip" },
            { ".xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" },
            { ".docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document" }
        };

        public HttpServer(string baseDir)
        {
            _baseDir = baseDir;
            if (File.Exists(Path.Combine(baseDir, "dist", "client", "index.html")))
            {
                _distDir = Path.Combine(baseDir, "dist", "client");
            }
            else
            {
                _distDir = Path.Combine(baseDir, "dist");
            }
        }

        public int Port { get { return _port; } }

        public bool Start(int preferredPort)
        {
            for (int p = preferredPort; p < preferredPort + 50; p++)
            {
                try
                {
                    _listener = new HttpListener();
                    _listener.Prefixes.Add(string.Format("http://127.0.0.1:{0}/", p));
                    _listener.Start();

                    _port = p;
                    _isRunning = true;
                    ThreadPool.QueueUserWorkItem(ListenLoop);
                    return true;
                }
                catch
                {
                    try { if (_listener != null) _listener.Close(); } catch { }
                    _listener = null;
                }
            }
            return false;
        }

        private void ListenLoop(object state)
        {
            while (_isRunning && _listener.IsListening)
            {
                try
                {
                    var context = _listener.GetContext();
                    ThreadPool.QueueUserWorkItem(ProcessRequest, context);
                }
                catch
                {
                    if (!_isRunning) break;
                }
            }
        }

        private void ProcessRequest(object state)
        {
            var context = (HttpListenerContext)state;
            var request = context.Request;
            var response = context.Response;

            try
            {
                // Standard CORS and security headers for offline local app
                response.AddHeader("Access-Control-Allow-Origin", "*");
                response.AddHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
                response.AddHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");

                if (request.HttpMethod.Equals("OPTIONS", StringComparison.OrdinalIgnoreCase))
                {
                    response.StatusCode = 204;
                    response.Close();
                    return;
                }

                string rawPath = request.Url.AbsolutePath;
                string urlPath = Uri.UnescapeDataString(rawPath);

                // 1. Launcher Control Endpoints
                if (urlPath.StartsWith("/api/launcher/", StringComparison.OrdinalIgnoreCase))
                {
                    HandleLauncherApi(context, urlPath);
                    return;
                }

                // 2. Native Workspace Browse Dialog
                if (urlPath.Equals("/api/workspace/browse", StringComparison.OrdinalIgnoreCase))
                {
                    HandleWorkspaceBrowse(context);
                    return;
                }

                // 3. Check if it's an API request to forward to Node or Python backend
                if (urlPath.StartsWith("/api/", StringComparison.OrdinalIgnoreCase))
                {
                    if (TryProxyToBackend(context, urlPath))
                    {
                        return;
                    }
                    // Return clean JSON response if backend is offline
                    response.StatusCode = 200;
                    response.ContentType = "application/json; charset=utf-8";
                    byte[] mockBytes = System.Text.Encoding.UTF8.GetBytes("{\"success\":false,\"error\":\"Local engine offline\"}");
                    response.OutputStream.Write(mockBytes, 0, mockBytes.Length);
                    response.Close();
                    return;
                }

                // 2. Direct file lookup in demo/ or models/ or per_design/
                string targetFilePath = null;

                if (urlPath.StartsWith("/demo/", StringComparison.OrdinalIgnoreCase) ||
                    urlPath.StartsWith("/models/", StringComparison.OrdinalIgnoreCase) ||
                    urlPath.StartsWith("/per_design/", StringComparison.OrdinalIgnoreCase))
                {
                    string rel = urlPath.TrimStart('/').Replace('/', Path.DirectorySeparatorChar);
                    string candidate = Path.Combine(_baseDir, rel);
                    if (File.Exists(candidate))
                    {
                        targetFilePath = candidate;
                    }
                    else
                    {
                        try
                        {
                            var parent = Directory.GetParent(_baseDir);
                            if (parent != null)
                            {
                                string parentCandidate = Path.Combine(parent.FullName, rel);
                                if (File.Exists(parentCandidate))
                                {
                                    targetFilePath = parentCandidate;
                                }
                            }
                        }
                        catch { }
                    }
                }

                // 3. Lookup in dist/
                if (targetFilePath == null)
                {
                    if (urlPath == "/" || string.IsNullOrEmpty(urlPath))
                    {
                        targetFilePath = Path.Combine(_distDir, "index.html");
                    }
                    else
                    {
                        string rel = urlPath.TrimStart('/').Replace('/', Path.DirectorySeparatorChar);
                        string candidate = Path.Combine(_distDir, rel);

                        if (File.Exists(candidate))
                        {
                            targetFilePath = candidate;
                        }
                        else if (Directory.Exists(candidate))
                        {
                            string indexInDir = Path.Combine(candidate, "index.html");
                            if (File.Exists(indexInDir))
                            {
                                targetFilePath = indexInDir;
                            }
                        }
                    }
                }

                // 4. SPA Fallback: if file has no extension and wasn't found, serve dist/index.html
                if (targetFilePath == null || !File.Exists(targetFilePath))
                {
                    string ext = Path.GetExtension(urlPath);
                    if (string.IsNullOrEmpty(ext) || ext.Equals(".html", StringComparison.OrdinalIgnoreCase))
                    {
                        string fallbackIndex = Path.Combine(_distDir, "index.html");
                        if (File.Exists(fallbackIndex))
                        {
                            targetFilePath = fallbackIndex;
                        }
                    }
                }

                // 5. Send file response or 404
                if (targetFilePath != null && File.Exists(targetFilePath))
                {
                    ServeFile(response, targetFilePath);
                }
                else
                {
                    response.StatusCode = 404;
                    byte[] notFoundBytes = System.Text.Encoding.UTF8.GetBytes("404 Not Found");
                    response.ContentType = "text/plain";
                    response.OutputStream.Write(notFoundBytes, 0, notFoundBytes.Length);
                    response.Close();
                }
            }
            catch (Exception ex)
            {
                try
                {
                    response.StatusCode = 500;
                    byte[] errBytes = System.Text.Encoding.UTF8.GetBytes("500 Server Error: " + ex.Message);
                    response.ContentType = "text/plain";
                    response.OutputStream.Write(errBytes, 0, errBytes.Length);
                    response.Close();
                }
                catch { }
            }
        }

        private void ServeFile(HttpListenerResponse response, string filePath)
        {
            string ext = Path.GetExtension(filePath);
            string contentType;
            if (!MimeTypes.TryGetValue(ext, out contentType))
            {
                contentType = "application/octet-stream";
            }

            response.ContentType = contentType;
            response.StatusCode = 200;

            if (filePath.Contains("_astro"))
            {
                response.AddHeader("Cache-Control", "public, max-age=31536000, immutable");
            }
            else
            {
                response.AddHeader("Cache-Control", "no-cache, no-store, must-revalidate");
            }

            using (var fs = new FileStream(filePath, FileMode.Open, FileAccess.Read, FileShare.Read))
            {
                response.ContentLength64 = fs.Length;
                byte[] buffer = new byte[64 * 1024];
                int bytesRead;
                while ((bytesRead = fs.Read(buffer, 0, buffer.Length)) > 0)
                {
                    response.OutputStream.Write(buffer, 0, bytesRead);
                }
            }
            response.Close();
        }

        private bool TryProxyToBackend(HttpListenerContext context, string urlPath)
        {
            int[] candidatePorts = new int[] { 4321, 8000, 3000 };
            foreach (int port in candidatePorts)
            {
                if (port == _port) continue;
                if (!IsPortListening(port)) continue;

                try
                {
                    string targetUrl = string.Format("http://127.0.0.1:{0}{1}{2}", port, urlPath, context.Request.Url.Query ?? "");
                    var proxyReq = (HttpWebRequest)WebRequest.Create(targetUrl);
                    proxyReq.Method = context.Request.HttpMethod;
                    proxyReq.ContentType = context.Request.ContentType;
                    proxyReq.Timeout = 10000;

                    if (context.Request.HasEntityBody)
                    {
                        using (var reqStream = proxyReq.GetRequestStream())
                        {
                            CopyStream(context.Request.InputStream, reqStream);
                        }
                    }

                    using (var proxyRes = (HttpWebResponse)proxyReq.GetResponse())
                    {
                        context.Response.StatusCode = (int)proxyRes.StatusCode;
                        context.Response.ContentType = proxyRes.ContentType;
                        using (var resStream = proxyRes.GetResponseStream())
                        {
                            CopyStream(resStream, context.Response.OutputStream);
                        }
                        context.Response.Close();
                        return true;
                    }
                }
                catch
                {
                    // Continue to next candidate port
                }
            }
            return false;
        }

        private static void CopyStream(Stream input, Stream output)
        {
            byte[] buffer = new byte[32 * 1024];
            int read;
            while ((read = input.Read(buffer, 0, buffer.Length)) > 0)
            {
                output.Write(buffer, 0, read);
            }
        }

        private void HandleLauncherApi(HttpListenerContext context, string urlPath)
        {
            var response = context.Response;
            response.ContentType = "application/json; charset=utf-8";

            if (urlPath.Equals("/api/launcher/status", StringComparison.OrdinalIgnoreCase))
            {
                bool ollamaActive = IsPortListening(11434);
                bool visionActive = IsPortListening(8080);
                string json = string.Format("{{\"ollama\":{0},\"visionServer\":{1},\"port\":{2},\"loadedModel\":\"{3}\"}}",
                    ollamaActive ? "true" : "false",
                    visionActive ? "true" : "false",
                    _port,
                    (Program.ActiveModelName ?? "").Replace("\\", "\\\\").Replace("\"", "\\\""));
                byte[] b = System.Text.Encoding.UTF8.GetBytes(json);
                response.StatusCode = 200;
                response.OutputStream.Write(b, 0, b.Length);
                response.Close();
                return;
            }

            if (urlPath.Equals("/api/launcher/start-all", StringComparison.OrdinalIgnoreCase))
            {
                Program.EnsureOllamaRunning(false);
                Program.StartVisionServer();
                string json = "{\"success\":true,\"message\":\"Started Ollama and Vision servers\"}";
                byte[] b = System.Text.Encoding.UTF8.GetBytes(json);
                response.StatusCode = 200;
                response.OutputStream.Write(b, 0, b.Length);
                response.Close();
                return;
            }

            if (urlPath.Equals("/api/launcher/scan-models", StringComparison.OrdinalIgnoreCase))
            {
                string targetDir = context.Request.QueryString["path"];
                string json = ScanModelsJson(targetDir);
                byte[] b = System.Text.Encoding.UTF8.GetBytes(json);
                response.StatusCode = 200;
                response.OutputStream.Write(b, 0, b.Length);
                response.Close();
                return;
            }

            if (urlPath.Equals("/api/launcher/browse-folder", StringComparison.OrdinalIgnoreCase))
            {
                string json = ShowBrowseFolderDialog();
                byte[] b = System.Text.Encoding.UTF8.GetBytes(json);
                response.StatusCode = 200;
                response.OutputStream.Write(b, 0, b.Length);
                response.Close();
                return;
            }

            if (urlPath.Equals("/api/launcher/load-model", StringComparison.OrdinalIgnoreCase))
            {
                string body = ReadRequestBody(context.Request);
                string modelPath = ExtractJsonField(body, "modelPath");
                bool ok = false;
                if (!string.IsNullOrEmpty(modelPath))
                {
                    ok = Program.StartModelServer(modelPath);
                }
                string json = string.Format("{{\"success\":{0},\"model\":\"{1}\"}}",
                    ok ? "true" : "false",
                    (modelPath ?? "").Replace("\\", "\\\\").Replace("\"", "\\\""));
                byte[] b = System.Text.Encoding.UTF8.GetBytes(json);
                response.StatusCode = ok ? 200 : 400;
                response.OutputStream.Write(b, 0, b.Length);
                response.Close();
                return;
            }

            if (urlPath.Equals("/api/launcher/start-vision", StringComparison.OrdinalIgnoreCase))
            {
                bool started = Program.StartVisionServer();
                string json = string.Format("{{\"success\":{0},\"message\":\"{1}\"}}",
                    started ? "true" : "false",
                    started ? "Vision engine initializing on port 8080" : "Could not locate vision model files or binary");
                byte[] b = System.Text.Encoding.UTF8.GetBytes(json);
                response.StatusCode = 200;
                response.OutputStream.Write(b, 0, b.Length);
                response.Close();
                return;
            }

            if (urlPath.Equals("/api/launcher/stop-vision", StringComparison.OrdinalIgnoreCase))
            {
                Program.StopVisionServer();
                byte[] b = System.Text.Encoding.UTF8.GetBytes("{\"success\":true,\"message\":\"Vision engine stopped\"}");
                response.StatusCode = 200;
                response.OutputStream.Write(b, 0, b.Length);
                response.Close();
                return;
            }

            if (urlPath.Equals("/api/launcher/start-ollama", StringComparison.OrdinalIgnoreCase))
            {
                Program.EnsureOllamaRunning(false);
                byte[] b = System.Text.Encoding.UTF8.GetBytes("{\"success\":true,\"message\":\"Ollama engine started\"}");
                response.StatusCode = 200;
                response.OutputStream.Write(b, 0, b.Length);
                response.Close();
                return;
            }

            response.StatusCode = 404;
            response.Close();
        }

        private string ReadRequestBody(HttpListenerRequest request)
        {
            if (!request.HasEntityBody) return "";
            try
            {
                using (var reader = new StreamReader(request.InputStream, request.ContentEncoding ?? System.Text.Encoding.UTF8))
                {
                    return reader.ReadToEnd();
                }
            }
            catch { return ""; }
        }

        private string ExtractJsonField(string json, string fieldName)
        {
            if (string.IsNullOrEmpty(json)) return "";
            string pattern = "\"" + fieldName + "\"\\s*:\\s*\"";
            var match = System.Text.RegularExpressions.Regex.Match(json, pattern);
            if (!match.Success) return "";
            int start = match.Index + match.Length;
            int end = json.IndexOf('"', start);
            if (end > start)
            {
                return json.Substring(start, end - start).Replace("\\\\", "\\").Replace("\\/", "/");
            }
            return "";
        }

        private string ScanModelsJson(string folderPath)
        {
            string targetFolder = Program.LocateModelsDirectory(folderPath);
            var list = new List<string>();

            if (Directory.Exists(targetFolder))
            {
                try
                {
                    var files = Directory.GetFiles(targetFolder, "*.gguf", SearchOption.AllDirectories);
                    foreach (var f in files)
                    {
                        try
                        {
                            var fi = new FileInfo(f);
                            double sizeGb = Math.Round((double)fi.Length / (1024.0 * 1024.0 * 1024.0), 2);
                            bool isMmproj = fi.Name.IndexOf("mmproj", StringComparison.OrdinalIgnoreCase) >= 0;
                            string escapedPath = f.Replace("\\", "\\\\").Replace("\"", "\\\"");
                            string escapedName = fi.Name.Replace("\\", "\\\\").Replace("\"", "\\\"");
                            string escapedDir = (fi.DirectoryName ?? "").Replace("\\", "\\\\").Replace("\"", "\\\"");

                            list.Add(string.Format("{{\"name\":\"{0}\",\"path\":\"{1}\",\"sizeGb\":{2},\"isMmproj\":{3},\"dir\":\"{4}\"}}",
                                escapedName, escapedPath, sizeGb.ToString(System.Globalization.CultureInfo.InvariantCulture), isMmproj ? "true" : "false", escapedDir));
                        }
                        catch { }
                    }
                }
                catch { }
            }

            string folderEscaped = (targetFolder ?? "").Replace("\\", "\\\\").Replace("\"", "\\\"");
            return string.Format("{{\"folder\":\"{0}\",\"models\":[{1}]}}", folderEscaped, string.Join(",", list.ToArray()));
        }

        private string ShowBrowseFolderDialog()
        {
            string selected = null;
            var thread = new Thread(new ThreadStart(delegate()
            {
                using (var fbd = new FolderBrowserDialog())
                {
                    fbd.Description = "Select folder containing GGUF models";
                    fbd.ShowNewFolderButton = false;
                    string defaultFolder = Program.LocateModelsDirectory();
                    if (Directory.Exists(defaultFolder))
                    {
                        fbd.SelectedPath = defaultFolder;
                    }
                    if (fbd.ShowDialog() == DialogResult.OK)
                    {
                        selected = fbd.SelectedPath;
                    }
                }
            }));
            thread.SetApartmentState(ApartmentState.STA);
            thread.Start();
            thread.Join(60000);

            if (!string.IsNullOrEmpty(selected))
            {
                return ScanModelsJson(selected);
            }
            return ScanModelsJson(null);
        }

        private void HandleWorkspaceBrowse(HttpListenerContext context)
        {
            var response = context.Response;
            response.ContentType = "application/json; charset=utf-8";
            string selected = null;
            var thread = new Thread(new ThreadStart(delegate()
            {
                using (var fbd = new FolderBrowserDialog())
                {
                    fbd.Description = "Select Project Folder";
                    fbd.ShowNewFolderButton = true;
                    if (fbd.ShowDialog() == DialogResult.OK)
                    {
                        selected = fbd.SelectedPath;
                    }
                }
            }));
            thread.SetApartmentState(ApartmentState.STA);
            thread.Start();
            thread.Join(60000);

            string json;
            if (!string.IsNullOrEmpty(selected))
            {
                string escaped = selected.Replace("\\", "\\\\").Replace("\"", "\\\"");
                json = string.Format("{{\"success\":true,\"path\":\"{0}\"}}", escaped);
            }
            else
            {
                json = "{\"success\":false,\"cancelled\":true}";
            }

            byte[] b = System.Text.Encoding.UTF8.GetBytes(json);
            response.StatusCode = 200;
            response.OutputStream.Write(b, 0, b.Length);
            response.Close();
        }

        public static bool IsPortListening(int port)
        {
            try
            {
                using (var client = new TcpClient())
                {
                    var result = client.BeginConnect("127.0.0.1", port, null, null);
                    if (result.AsyncWaitHandle.WaitOne(400) && client.Connected)
                    {
                        client.EndConnect(result);
                        return true;
                    }
                }
            }
            catch { }
            return false;
        }

        public void Stop()
        {
            _isRunning = false;
            try
            {
                if (_listener != null && _listener.IsListening)
                {
                    _listener.Stop();
                    _listener.Close();
                }
            }
            catch { }
        }
    }

    public class MainForm : Form
    {
        private readonly WebView2 _webView;
        private readonly HttpServer _server;
        private readonly int _port;
        private bool _isFullscreen = false;
        private FormWindowState _previousWindowState;
        private FormBorderStyle _previousBorderStyle;

        public MainForm(string baseDir, int port, HttpServer server)
        {
            _port = port;
            _server = server;

            // 1. Native Desktop Window Configuration
            this.Text = "LUMI — Sovereign Industrial AI Workbench";
            this.Width = 1440;
            this.Height = 920;
            this.MinimumSize = new Size(960, 600);
            this.StartPosition = FormStartPosition.CenterScreen;
            this.BackColor = Color.FromArgb(25, 26, 26); // Perplexity #191A1A matte dark

            // Load custom application icon
            try
            {
                this.Icon = Icon.ExtractAssociatedIcon(Application.ExecutablePath);
            }
            catch
            {
                string iconPath = Path.Combine(baseDir, "launcher", "app.ico");
                if (!File.Exists(iconPath)) iconPath = Path.Combine(baseDir, "app.ico");
                if (!File.Exists(iconPath)) iconPath = Path.Combine(baseDir, "public", "favicon.ico");
                if (!File.Exists(iconPath)) iconPath = Path.Combine(baseDir, "dist", "favicon.ico");
                if (File.Exists(iconPath))
                {
                    try { this.Icon = new Icon(iconPath); } catch { }
                }
            }

            // 2. Embedded Native WebView2 Control
            _webView = new WebView2();
            _webView.Dock = DockStyle.Fill;
            _webView.DefaultBackgroundColor = Color.FromArgb(25, 26, 26);
            this.Controls.Add(_webView);

            // 3. Native Keyboard Shortcuts (F11 Fullscreen, Ctrl+R Reload, F12 DevTools)
            this.KeyPreview = true;
            this.KeyDown += OnKeyDown;

            // 4. Initialize on Form Load
            this.Load += async (s, e) =>
            {
                try
                {
                    string userDataDir = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "LUMI_Workbench_Data");
                    var env = await CoreWebView2Environment.CreateAsync(null, userDataDir);
                    await _webView.EnsureCoreWebView2Async(env);

                    _webView.CoreWebView2.Settings.IsStatusBarEnabled = false;
                    _webView.CoreWebView2.Settings.AreDefaultContextMenusEnabled = true;
                    _webView.CoreWebView2.Settings.AreDevToolsEnabled = true;
                    _webView.CoreWebView2.Settings.IsZoomControlEnabled = true;

                    // Prevent external browser popups; keep all navigation within the native window
                    _webView.CoreWebView2.NewWindowRequested += (s2, e2) =>
                    {
                        e2.Handled = true;
                        if (!string.IsNullOrEmpty(e2.Uri))
                        {
                            _webView.CoreWebView2.Navigate(e2.Uri);
                        }
                    };

                    // Navigate to local application
                    int targetNavPort = _port;
                    if (HttpServer.IsPortListening(4321))
                    {
                        targetNavPort = 4321;
                    }
                    _webView.CoreWebView2.Navigate(string.Format("http://127.0.0.1:{0}/", targetNavPort));
                }
                catch (Exception ex)
                {
                    MessageBox.Show(
                        string.Format("Error initializing offline desktop view:\n\n{0}\n\nPlease ensure Microsoft Edge WebView2 Runtime is installed.", ex.Message),
                        "LUMI — Initialization Error",
                        MessageBoxButtons.OK,
                        MessageBoxIcon.Error
                    );
                }
            };

            // 5. Clean Shutdown when user closes the window
            this.FormClosing += (s, e) =>
            {
                try
                {
                    if (_server != null)
                    {
                        _server.Stop();
                    }
                    _webView.Dispose();
                }
                catch { }
            };
        }

        private void OnKeyDown(object sender, KeyEventArgs e)
        {
            // F11: Toggle Fullscreen
            if (e.KeyCode == Keys.F11)
            {
                e.Handled = true;
                ToggleFullscreen();
            }
            // F5 or Ctrl+R: Reload
            else if (e.KeyCode == Keys.F5 || (e.Control && e.KeyCode == Keys.R))
            {
                e.Handled = true;
                _webView.Reload();
            }
            // F12: Toggle DevTools
            else if (e.KeyCode == Keys.F12)
            {
                e.Handled = true;
                if (_webView.CoreWebView2 != null)
                {
                    _webView.CoreWebView2.OpenDevToolsWindow();
                }
            }
        }

        private void ToggleFullscreen()
        {
            if (!_isFullscreen)
            {
                _previousWindowState = this.WindowState;
                _previousBorderStyle = this.FormBorderStyle;
                this.FormBorderStyle = FormBorderStyle.None;
                this.WindowState = FormWindowState.Maximized;
                _isFullscreen = true;
            }
            else
            {
                this.FormBorderStyle = _previousBorderStyle;
                this.WindowState = _previousWindowState;
                _isFullscreen = false;
            }
        }
    }

    static class Program
    {
        [DllImport("kernel32.dll", SetLastError = true)]
        private static extern bool AllocConsole();

        private static HttpServer _server;
        private static string _baseDir;
        private static int _port = 4321;

        [STAThread]
        static void Main(string[] args)
        {
            try
            {
                Application.EnableVisualStyles();
                Application.SetCompatibleTextRenderingDefault(false);

                bool showConsole = false;
                bool noWindow = false;

            foreach (string arg in args)
            {
                if (arg.Equals("--console", StringComparison.OrdinalIgnoreCase) ||
                    arg.Equals("--debug", StringComparison.OrdinalIgnoreCase))
                {
                    showConsole = true;
                }
                else if (arg.Equals("--no-window", StringComparison.OrdinalIgnoreCase))
                {
                    noWindow = true;
                }
                else if (arg.StartsWith("--port=", StringComparison.OrdinalIgnoreCase))
                {
                    int p;
                    if (int.TryParse(arg.Substring(7), out p))
                    {
                        _port = p;
                    }
                }
            }

            if (showConsole)
            {
                AllocConsole();
                Console.Title = "LUMI Desktop Console";
                Console.WriteLine("==================================================================");
                Console.WriteLine("  LUMI — OFFLINE DESKTOP AGENTIC AI WORKBENCH");
                Console.WriteLine("==================================================================");
            }

            _baseDir = AppDomain.CurrentDomain.BaseDirectory.TrimEnd(Path.DirectorySeparatorChar, Path.AltDirectorySeparatorChar);

            // Verify dist directory exists
            string distPath = Path.Combine(_baseDir, "dist");
            if (File.Exists(Path.Combine(distPath, "client", "index.html")))
            {
                distPath = Path.Combine(distPath, "client");
            }
            else if (!Directory.Exists(distPath) || !File.Exists(Path.Combine(distPath, "index.html")))
            {
                string parentDist = Path.Combine(Directory.GetParent(_baseDir).FullName, "dist");
                if (File.Exists(Path.Combine(parentDist, "client", "index.html")))
                {
                    _baseDir = Directory.GetParent(_baseDir).FullName;
                    distPath = Path.Combine(parentDist, "client");
                }
                else if (Directory.Exists(parentDist) && File.Exists(Path.Combine(parentDist, "index.html")))
                {
                    _baseDir = Directory.GetParent(_baseDir).FullName;
                    distPath = parentDist;
                }
                else
                {
                    MessageBox.Show(
                        "Could not locate 'dist/index.html'.\n\nPlease ensure the application has been built with 'npm run build' before launching.",
                        "LUMI — Missing Build Files",
                        MessageBoxButtons.OK,
                        MessageBoxIcon.Warning
                    );
                }
            }

            // Automatically ensure local Ollama inference service is active
            EnsureOllamaRunning(showConsole);

            // Automatically ensure local Node.js application server is active
            EnsureNodeServerRunning(showConsole);

            // Start HTTP server with dynamic port fallback
            _server = new HttpServer(_baseDir);
            if (!_server.Start(_port))
            {
                MessageBox.Show(
                    string.Format("Failed to start local offline server on ports {0} through {1}.\n\nPlease ensure no security software is blocking loopback listeners.", _port, _port + 50),
                    "LUMI — Server Error",
                    MessageBoxButtons.OK,
                    MessageBoxIcon.Error
                );
                return;
            }

            _port = _server.Port;

            if (showConsole)
            {
                Console.WriteLine(string.Format("Serving files from: {0}", distPath));
                Console.WriteLine(string.Format("Local HTTP URL:     http://127.0.0.1:{0}/", _port));
                Console.WriteLine("Starting embedded offline server...");
            }

            // Launch Native Desktop Window
            if (!noWindow)
            {
                var mainForm = new MainForm(_baseDir, _port, _server);
                Application.Run(mainForm);
            }
            else
            {
                new System.Threading.ManualResetEvent(false).WaitOne();
            }

            // Clean shutdown
            if (_server != null)
            {
                _server.Stop();
            }
            StopVisionServer();
            StopNodeServer();
            }
            catch (Exception ex)
            {
                try
                {
                    File.WriteAllText(Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "lumi_startup_err.log"), ex.ToString());
                    MessageBox.Show(ex.ToString(), "LUMI Fatal Startup Error");
                }
                catch { }
            }
        }

        public static string LocateModelsDirectory(string preferred = null)
        {
            var candidates = new List<string>();

            if (!string.IsNullOrEmpty(preferred))
            {
                if (Path.IsPathRooted(preferred) && Directory.Exists(preferred))
                {
                    candidates.Add(preferred);
                }
                else
                {
                    if (!string.IsNullOrEmpty(_baseDir))
                    {
                        string p1 = Path.Combine(_baseDir, preferred);
                        if (Directory.Exists(p1)) candidates.Add(p1);

                        try
                        {
                            var parent = Directory.GetParent(_baseDir);
                            if (parent != null)
                            {
                                string p2 = Path.Combine(parent.FullName, preferred);
                                if (Directory.Exists(p2)) candidates.Add(p2);
                            }
                        }
                        catch { }
                    }

                    try
                    {
                        string cwdPref = Path.Combine(Directory.GetCurrentDirectory(), preferred);
                        if (Directory.Exists(cwdPref) && !candidates.Contains(cwdPref)) candidates.Add(cwdPref);
                    }
                    catch { }
                }
            }

            // Standard locations
            if (!string.IsNullOrEmpty(_baseDir))
            {
                string d1 = Path.Combine(_baseDir, "models");
                if (Directory.Exists(d1) && !candidates.Contains(d1)) candidates.Add(d1);

                try
                {
                    var parent = Directory.GetParent(_baseDir);
                    if (parent != null)
                    {
                        string d2 = Path.Combine(parent.FullName, "models");
                        if (Directory.Exists(d2) && !candidates.Contains(d2)) candidates.Add(d2);

                        var gparent = parent.Parent;
                        if (gparent != null)
                        {
                            string d3 = Path.Combine(gparent.FullName, "models");
                            if (Directory.Exists(d3) && !candidates.Contains(d3)) candidates.Add(d3);
                        }
                    }
                }
                catch { }
            }

            try
            {
                string cwdModels = Path.Combine(Directory.GetCurrentDirectory(), "models");
                if (Directory.Exists(cwdModels) && !candidates.Contains(cwdModels)) candidates.Add(cwdModels);
            }
            catch { }

            // 1. Return the first candidate that actually contains .gguf files
            foreach (var c in candidates)
            {
                try
                {
                    if (Directory.Exists(c) && Directory.GetFiles(c, "*.gguf", SearchOption.AllDirectories).Length > 0)
                    {
                        return c;
                    }
                }
                catch { }
            }

            // 2. Return first existing directory among candidates
            foreach (var c in candidates)
            {
                if (Directory.Exists(c)) return c;
            }

            return Path.Combine(_baseDir ?? AppDomain.CurrentDomain.BaseDirectory, "models");
        }

        public static void EnsureOllamaRunning(bool showConsole)
        {
            try
            {
                using (var client = new TcpClient())
                {
                    var result = client.BeginConnect("127.0.0.1", 11434, null, null);
                    bool success = result.AsyncWaitHandle.WaitOne(600);
                    if (success && client.Connected)
                    {
                        client.EndConnect(result);
                        if (showConsole)
                        {
                            Console.WriteLine("[LUMI] Local inference engine is already active on 127.0.0.1:11434.");
                        }
                        return;
                    }
                }
            }
            catch { }

            try
            {
                string localExe = Path.Combine(_baseDir, "llama_server", "ollama.exe");
                string localBat = Path.Combine(_baseDir, "llama_server", "start_server.bat");
                string appDataExe = Path.Combine(
                    Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
                    "Programs", "Ollama", "ollama.exe"
                );

                string targetBinary = null;
                string targetArgs = "";

                if (File.Exists(localExe))
                {
                    targetBinary = localExe;
                    targetArgs = "serve";
                }
                else if (File.Exists(localBat))
                {
                    targetBinary = localBat;
                    targetArgs = "";
                }
                else if (File.Exists(appDataExe))
                {
                    targetBinary = appDataExe;
                    targetArgs = "serve";
                }
                else
                {
                    targetBinary = "ollama";
                    targetArgs = "serve";
                }

                if (showConsole)
                {
                    Console.WriteLine(string.Format("[LUMI] Auto-starting local inference engine: {0} {1}", targetBinary, targetArgs));
                }

                var psi = new System.Diagnostics.ProcessStartInfo
                {
                    FileName = targetBinary,
                    Arguments = targetArgs,
                    UseShellExecute = false,
                    CreateNoWindow = true,
                    WindowStyle = System.Diagnostics.ProcessWindowStyle.Hidden,
                    WorkingDirectory = Directory.Exists(Path.Combine(_baseDir, "llama_server")) ? Path.Combine(_baseDir, "llama_server") : _baseDir
                };

                System.Diagnostics.Process.Start(psi);

                // Wait up to 5 seconds for loopback listener on port 11434 to become active
                for (int i = 0; i < 25; i++)
                {
                    Thread.Sleep(200);
                    try
                    {
                        using (var client = new TcpClient())
                        {
                            var r = client.BeginConnect("127.0.0.1", 11434, null, null);
                            if (r.AsyncWaitHandle.WaitOne(200) && client.Connected)
                            {
                                client.EndConnect(r);
                                if (showConsole)
                                {
                                    Console.WriteLine("[LUMI] Inference engine is now ready on 127.0.0.1:11434.");
                                }
                                break;
                            }
                        }
                    }
                    catch { }
                }
            }
            catch (Exception ex)
            {
                if (showConsole)
                {
                    Console.WriteLine("[LUMI] Note: Could not auto-spawn llama inference server: " + ex.Message);
                }
            }
        }

        private static System.Diagnostics.Process _visionProcess = null;
        public static string ActiveModelName = "Local Sovereign Model";

        public static bool StartModelServer(string customModelPath)
        {
            try
            {
                StopVisionServer();
                Thread.Sleep(300);

                string[] possibleExes = new string[]
                {
                    Path.Combine(_baseDir, "llama_server", "llama-server.exe"),
                    Path.Combine(_baseDir, "llama", "llama-server.exe"),
                    "llama-server"
                };

                string serverExe = null;
                string workingDir = null;
                foreach (string exe in possibleExes)
                {
                    if (File.Exists(exe))
                    {
                        serverExe = exe;
                        workingDir = Path.GetDirectoryName(exe);
                        break;
                    }
                }

                if (string.IsNullOrEmpty(serverExe)) return false;

                if (!File.Exists(customModelPath))
                {
                    string modelsDir = LocateModelsDirectory();
                    if (Directory.Exists(modelsDir))
                    {
                        foreach (var f in Directory.GetFiles(modelsDir, "*.gguf", SearchOption.AllDirectories))
                        {
                            if (Path.GetFileName(f).Equals(Path.GetFileName(customModelPath), StringComparison.OrdinalIgnoreCase))
                            {
                                customModelPath = f;
                                break;
                            }
                        }
                    }
                }

                if (!File.Exists(customModelPath)) return false;

                // Check for mmproj in model directory or models directory
                string dir = Path.GetDirectoryName(customModelPath);
                string mmprojPath = null;
                if (!string.IsNullOrEmpty(dir) && Directory.Exists(dir))
                {
                    foreach (var f in Directory.GetFiles(dir, "*mmproj*.gguf", SearchOption.AllDirectories))
                    {
                        mmprojPath = f;
                        break;
                    }
                }
                if (string.IsNullOrEmpty(mmprojPath))
                {
                    string modelsDir = LocateModelsDirectory();
                    if (Directory.Exists(modelsDir))
                    {
                        foreach (var f in Directory.GetFiles(modelsDir, "*mmproj*.gguf", SearchOption.AllDirectories))
                        {
                            mmprojPath = f;
                            break;
                        }
                    }
                }

                string args = string.Format("-m \"{0}\" --port 8080 -ngl 99 -c 4096", customModelPath);
                if (!string.IsNullOrEmpty(mmprojPath) && File.Exists(mmprojPath) && customModelPath.IndexOf("mmproj", StringComparison.OrdinalIgnoreCase) < 0)
                {
                    args += string.Format(" --mmproj \"{0}\"", mmprojPath);
                }

                var psi = new System.Diagnostics.ProcessStartInfo
                {
                    FileName = serverExe,
                    Arguments = args,
                    UseShellExecute = false,
                    CreateNoWindow = true,
                    WindowStyle = System.Diagnostics.ProcessWindowStyle.Hidden,
                    WorkingDirectory = workingDir ?? _baseDir
                };

                _visionProcess = System.Diagnostics.Process.Start(psi);
                ActiveModelName = Path.GetFileName(customModelPath);
                return true;
            }
            catch
            {
                return false;
            }
        }

        public static bool StartVisionServer()
        {
            try
            {
                if (HttpServer.IsPortListening(8080))
                {
                    return true;
                }
            }
            catch { }

            try
            {
                string[] possibleExes = new string[]
                {
                    Path.Combine(_baseDir, "llama", "llama-server.exe"),
                    Path.Combine(_baseDir, "llama_server", "llama-server.exe"),
                    "llama-server"
                };

                string visionExe = null;
                string workingDir = null;
                foreach (string exe in possibleExes)
                {
                    if (File.Exists(exe))
                    {
                        visionExe = exe;
                        workingDir = Path.GetDirectoryName(exe);
                        break;
                    }
                }

                if (string.IsNullOrEmpty(visionExe)) return false;

                // Dynamically locate models directory
                string modelsDir = LocateModelsDirectory();

                string modelPath = null;
                string mmprojPath = null;

                if (Directory.Exists(modelsDir))
                {
                    var allGgufs = Directory.GetFiles(modelsDir, "*.gguf", SearchOption.AllDirectories);
                    
                    // Look for multimodal projector
                    foreach (var f in allGgufs)
                    {
                        if (Path.GetFileName(f).IndexOf("mmproj", StringComparison.OrdinalIgnoreCase) >= 0)
                        {
                            mmprojPath = f;
                            break;
                        }
                    }

                    // Look for vision model first (has vl/vision in filename)
                    foreach (var f in allGgufs)
                    {
                        string fn = Path.GetFileName(f);
                        if (fn.IndexOf("mmproj", StringComparison.OrdinalIgnoreCase) >= 0) continue;
                        if (fn.IndexOf("vl", StringComparison.OrdinalIgnoreCase) >= 0 || fn.IndexOf("vision", StringComparison.OrdinalIgnoreCase) >= 0)
                        {
                            modelPath = f;
                            break;
                        }
                    }

                    // If no explicit vision model, use any general GGUF model
                    if (string.IsNullOrEmpty(modelPath))
                    {
                        foreach (var f in allGgufs)
                        {
                            if (Path.GetFileName(f).IndexOf("mmproj", StringComparison.OrdinalIgnoreCase) < 0)
                            {
                                modelPath = f;
                                break;
                            }
                        }
                    }
                }

                if (string.IsNullOrEmpty(modelPath)) return false;

                string args = string.Format("-m \"{0}\" --port 8080 -ngl 99 -c 4096", modelPath);
                if (!string.IsNullOrEmpty(mmprojPath) && File.Exists(mmprojPath))
                {
                    args += string.Format(" --mmproj \"{0}\"", mmprojPath);
                }

                var psi = new System.Diagnostics.ProcessStartInfo
                {
                    FileName = visionExe,
                    Arguments = args,
                    UseShellExecute = false,
                    CreateNoWindow = true,
                    WindowStyle = System.Diagnostics.ProcessWindowStyle.Hidden,
                    WorkingDirectory = workingDir ?? _baseDir
                };

                _visionProcess = System.Diagnostics.Process.Start(psi);
                ActiveModelName = Path.GetFileName(modelPath);
                return true;
            }
            catch
            {
                return false;
            }
        }

        public static void StopVisionServer()
        {
            try
            {
                if (_visionProcess != null && !_visionProcess.HasExited)
                {
                    _visionProcess.Kill();
                    _visionProcess = null;
                }
            }
            catch { }

            try
            {
                foreach (var p in System.Diagnostics.Process.GetProcessesByName("llama-server"))
                {
                    try { p.Kill(); } catch { }
                }
            }
            catch { }
        }

        private static System.Diagnostics.Process _nodeProcess = null;

        public static void EnsureNodeServerRunning(bool showConsole)
        {
            if (HttpServer.IsPortListening(4321))
            {
                if (showConsole) Console.WriteLine("[LUMI] Application server is already active on port 4321.");
                return;
            }

            try
            {
                string entryFile = Path.Combine(_baseDir, "dist", "server", "entry.mjs");
                if (!File.Exists(entryFile))
                {
                    var parent = Directory.GetParent(_baseDir);
                    if (parent != null)
                    {
                        string pEntry = Path.Combine(parent.FullName, "dist", "server", "entry.mjs");
                        if (File.Exists(pEntry)) entryFile = pEntry;
                    }
                }

                if (File.Exists(entryFile))
                {
                    string workDir = Path.GetDirectoryName(Path.GetDirectoryName(Path.GetDirectoryName(entryFile)));
                    if (string.IsNullOrEmpty(workDir) || !Directory.Exists(workDir)) workDir = _baseDir;

                    var psi = new System.Diagnostics.ProcessStartInfo
                    {
                        FileName = "node.exe",
                        Arguments = string.Format("\"{0}\"", entryFile),
                        WorkingDirectory = workDir,
                        UseShellExecute = false,
                        CreateNoWindow = true,
                        WindowStyle = System.Diagnostics.ProcessWindowStyle.Hidden
                    };
                    psi.EnvironmentVariables["PORT"] = "4321";
                    psi.EnvironmentVariables["HOST"] = "127.0.0.1";

                    _nodeProcess = System.Diagnostics.Process.Start(psi);
                    if (showConsole) Console.WriteLine("[LUMI] Spawning local application server on port 4321...");

                    for (int i = 0; i < 20; i++)
                    {
                        Thread.Sleep(200);
                        if (HttpServer.IsPortListening(4321))
                        {
                            if (showConsole) Console.WriteLine("[LUMI] Application server is ready on port 4321.");
                            break;
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                if (showConsole) Console.WriteLine("[LUMI] Note: Could not auto-spawn node server: " + ex.Message);
            }
        }

        public static void StopNodeServer()
        {
            try
            {
                if (_nodeProcess != null && !_nodeProcess.HasExited)
                {
                    _nodeProcess.Kill();
                    _nodeProcess = null;
                }
            }
            catch { }
        }
    }
}
