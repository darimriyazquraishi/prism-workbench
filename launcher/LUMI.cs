using System;
using System.IO;
using System.Net;
using System.Net.Sockets;
using System.Diagnostics;
using System.Threading;
using System.Collections.Generic;
using System.Windows.Forms;
using System.Drawing;
using System.Runtime.InteropServices;

namespace LUMI.Launcher
{
    public class HttpServer
    {
        private HttpListener _listener;
        private readonly string _baseDir;
        private readonly string _distDir;
        private readonly int _port;
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

        public HttpServer(string baseDir, int port)
        {
            _baseDir = baseDir;
            _distDir = Path.Combine(baseDir, "dist");
            _port = port;
        }

        public void Start()
        {
            _isRunning = true;
            _listener = new HttpListener();
            _listener.Prefixes.Add(string.Format("http://127.0.0.1:{0}/", _port));
            _listener.Prefixes.Add(string.Format("http://localhost:{0}/", _port));
            _listener.Start();

            ThreadPool.QueueUserWorkItem(ListenLoop);
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
                // Set default CORS headers for local execution
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

                // 1. Check if it's an API request to forward to Python backend (if running on port 8000)
                if (urlPath.StartsWith("/api/", StringComparison.OrdinalIgnoreCase))
                {
                    if (TryProxyToBackend(context, urlPath))
                    {
                        return;
                    }
                    // Return local mock/fallback JSON response if backend is offline
                    response.StatusCode = 200;
                    response.ContentType = "application/json; charset=utf-8";
                    byte[] mockBytes = System.Text.Encoding.UTF8.GetBytes("{\"status\":\"local_deterministic\",\"air_gapped\":true,\"message\":\"Local on-premise engine active.\"}");
                    response.OutputStream.Write(mockBytes, 0, mockBytes.Length);
                    response.Close();
                    return;
                }

                // 2. Direct file lookup in demo/ or models/ or public/
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

            // Cache static assets (_astro) for performance, but not index.html
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
            try
            {
                string targetUrl = "http://127.0.0.1:8000" + urlPath + (context.Request.Url.Query ?? "");
                var proxyReq = (HttpWebRequest)WebRequest.Create(targetUrl);
                proxyReq.Method = context.Request.HttpMethod;
                proxyReq.ContentType = context.Request.ContentType;
                proxyReq.Timeout = 4000;

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
                return false;
            }
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

    static class Program
    {
        [DllImport("kernel32.dll", SetLastError = true)]
        private static extern bool AllocConsole();

        [DllImport("kernel32.dll")]
        private static extern IntPtr GetConsoleWindow();

        [DllImport("user32.dll")]
        private static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);

        private const int SW_HIDE = 0;
        private const int SW_SHOW = 5;

        private static NotifyIcon _trayIcon;
        private static HttpServer _server;
        private static Process _browserProcess;
        private static string _appUrl;
        private static string _baseDir;
        private static int _port = 4321;

        [STAThread]
        static void Main(string[] args)
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);

            bool showConsole = false;
            bool noBrowser = false;

            foreach (string arg in args)
            {
                if (arg.Equals("--console", StringComparison.OrdinalIgnoreCase) ||
                    arg.Equals("--debug", StringComparison.OrdinalIgnoreCase))
                {
                    showConsole = true;
                }
                else if (arg.Equals("--no-browser", StringComparison.OrdinalIgnoreCase))
                {
                    noBrowser = true;
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
                Console.Title = "LUMI Server Console";
                Console.WriteLine("==================================================================");
                Console.WriteLine("  LUMI / PRISM WORKBENCH — ON-PREMISE AI DESKTOP LAUNCHER");
                Console.WriteLine("==================================================================");
            }

            _baseDir = AppDomain.CurrentDomain.BaseDirectory.TrimEnd(Path.DirectorySeparatorChar, Path.AltDirectorySeparatorChar);

            // Verify dist directory exists
            string distPath = Path.Combine(_baseDir, "dist");
            if (!Directory.Exists(distPath) || !File.Exists(Path.Combine(distPath, "index.html")))
            {
                // Try to see if dist is in parent directory
                string parentDist = Path.Combine(Directory.GetParent(_baseDir).FullName, "dist");
                if (Directory.Exists(parentDist))
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

            // Find available port starting from _port
            _port = FindAvailablePort(_port);
            _appUrl = string.Format("http://127.0.0.1:{0}/", _port);

            if (showConsole)
            {
                Console.WriteLine(string.Format("Serving files from: {0}", distPath));
                Console.WriteLine(string.Format("Local HTTP URL:     {0}", _appUrl));
                Console.WriteLine("Starting embedded server...");
            }

            // Start HTTP server
            _server = new HttpServer(_baseDir, _port);
            try
            {
                _server.Start();
            }
            catch (Exception ex)
            {
                MessageBox.Show(
                    string.Format("Failed to start local server on port {0}:\n\n{1}", _port, ex.Message),
                    "LUMI — Server Error",
                    MessageBoxButtons.OK,
                    MessageBoxIcon.Error
                );
                return;
            }

            // Setup System Tray Icon
            SetupTrayIcon();

            // Launch Desktop Window (Edge App Mode)
            if (!noBrowser)
            {
                LaunchDesktopWindow();
            }

            // Message loop
            Application.Run();

            // Clean shutdown
            Shutdown();
        }

        private static int FindAvailablePort(int startingPort)
        {
            for (int p = startingPort; p < startingPort + 50; p++)
            {
                try
                {
                    TcpListener l = new TcpListener(IPAddress.Loopback, p);
                    l.Start();
                    l.Stop();
                    return p;
                }
                catch { }
            }
            return startingPort;
        }

        private static void SetupTrayIcon()
        {
            _trayIcon = new NotifyIcon();
            _trayIcon.Text = string.Format("LUMI — On-Premise AI ({0})", _appUrl);

            // Try loading custom icon from public/favicon.ico or dist/favicon.ico
            string iconPath = Path.Combine(_baseDir, "public", "favicon.ico");
            if (!File.Exists(iconPath))
            {
                iconPath = Path.Combine(_baseDir, "dist", "favicon.ico");
            }

            if (File.Exists(iconPath))
            {
                try
                {
                    _trayIcon.Icon = new Icon(iconPath);
                }
                catch
                {
                    _trayIcon.Icon = SystemIcons.Application;
                }
            }
            else
            {
                _trayIcon.Icon = SystemIcons.Application;
            }

            _trayIcon.Visible = true;

            // Context Menu
            ContextMenu menu = new ContextMenu();
            menu.MenuItems.Add(new MenuItem("Open LUMI Window", (s, e) => LaunchDesktopWindow()));
            menu.MenuItems.Add(new MenuItem("Open in Browser", (s, e) => Process.Start(_appUrl)));
            menu.MenuItems.Add(new MenuItem("Open Project Folder", (s, e) => Process.Start("explorer.exe", _baseDir)));
            menu.MenuItems.Add("-");
            menu.MenuItems.Add(new MenuItem("Exit LUMI", (s, e) => {
                Shutdown();
                Application.Exit();
            }));

            _trayIcon.ContextMenu = menu;
            _trayIcon.DoubleClick += (s, e) => LaunchDesktopWindow();
        }

        private static void LaunchDesktopWindow()
        {
            string[] candidatePaths = new string[]
            {
                Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86), "Microsoft\\Edge\\Application\\msedge.exe"),
                Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles), "Microsoft\\Edge\\Application\\msedge.exe"),
                Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "Microsoft\\Edge\\Application\\msedge.exe"),
                Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles), "Google\\Chrome\\Application\\chrome.exe"),
                Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86), "Google\\Chrome\\Application\\chrome.exe"),
                Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "Google\\Chrome\\Application\\chrome.exe")
            };

            string browserExe = null;
            foreach (string p in candidatePaths)
            {
                if (File.Exists(p))
                {
                    browserExe = p;
                    break;
                }
            }

            string userDataDir = Path.Combine(Path.GetTempPath(), "LUMI_App_Profile");

            if (browserExe != null)
            {
                ProcessStartInfo psi = new ProcessStartInfo
                {
                    FileName = browserExe,
                    Arguments = string.Format("--app=\"{0}\" --window-size=1440,920 --user-data-dir=\"{1}\" --no-first-run --no-default-browser-check", _appUrl, userDataDir),
                    UseShellExecute = false
                };

                try
                {
                    _browserProcess = Process.Start(psi);

                    // Monitor browser process: if closed and no other window, exit cleanly
                    if (_browserProcess != null)
                    {
                        new Thread(() =>
                        {
                            try
                            {
                                _browserProcess.WaitForExit();
                                Thread.Sleep(300);
                                Application.Exit();
                            }
                            catch { }
                        }) { IsBackground = true }.Start();
                    }
                }
                catch
                {
                    Process.Start(_appUrl);
                }
            }
            else
            {
                Process.Start(_appUrl);
            }
        }

        private static void Shutdown()
        {
            if (_trayIcon != null)
            {
                _trayIcon.Visible = false;
                _trayIcon.Dispose();
                _trayIcon = null;
            }

            if (_server != null)
            {
                _server.Stop();
                _server = null;
            }
        }
    }
}
