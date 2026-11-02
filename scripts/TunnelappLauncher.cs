using System;
using System.IO;
using System.Net;
using System.Net.Sockets;
using System.Text;
using System.Diagnostics;
using System.Threading;
using System.Collections.Generic;
using System.Reflection;
using System.IO.Compression;

namespace Tunnelapp
{
    static class Program
    {
        private static TcpListener _tcpListener;
        private static int _port;
        private static volatile bool _running = true;
        private static DateTime _lastActivity = DateTime.UtcNow;
        private static DateTime _startTime = DateTime.UtcNow;
        private static readonly Dictionary<string, byte[]> _memoryFiles = new Dictionary<string, byte[]>(StringComparer.OrdinalIgnoreCase);

        // Win32 Unicode native dialog - requires NO Windows Forms dependencies
        [System.Runtime.InteropServices.DllImport("user32.dll", EntryPoint = "MessageBoxW", CharSet = System.Runtime.InteropServices.CharSet.Unicode)]
        private static extern int ShowNativeBox(IntPtr hWnd, string text, string caption, uint type);

        private static void ShowError(string message, string caption)
        {
            try { ShowNativeBox(IntPtr.Zero, message, caption, 0x10); } // MB_OK | MB_ICONERROR
            catch { Console.WriteLine(caption + ": " + message); }
        }

        private static void ShowWarning(string message, string caption)
        {
            try { ShowNativeBox(IntPtr.Zero, message, caption, 0x30); } // MB_OK | MB_ICONWARNING
            catch { Console.WriteLine(caption + ": " + message); }
        }

        [STAThread]
        static void Main(string[] args)
        {
            _startTime = DateTime.UtcNow;
            _lastActivity = DateTime.UtcNow;

            // 1. Load self-contained embedded assets directly from the EXE binary
            bool loaded = LoadEmbeddedBundle();
            if (!loaded)
            {
                // Fallback check on disk (for development mode)
                string exeDir = AppDomain.CurrentDomain.BaseDirectory;
                string webRoot = LocateWebRoot(exeDir);
                if (webRoot != null && File.Exists(Path.Combine(webRoot, "index.html")))
                {
                    LoadDiskFiles(webRoot);
                    loaded = _memoryFiles.ContainsKey("index.html");
                }
            }

            if (!loaded || !_memoryFiles.ContainsKey("index.html"))
            {
                ShowError(
                    "Application assets could not be extracted from the executable.\n\nPlease ensure Tunnelapp1.0.exe is intact and not corrupted.",
                    "Tunnelapp 1.0 - Startup Error"
                );
                return;
            }

            // 2. Start internal lightweight TCP loopback server
            // Uses standard Berkeley sockets - requires ZERO Administrator permissions
            try
            {
                _tcpListener = new TcpListener(IPAddress.Loopback, 0);
                _tcpListener.Start();
                _port = ((IPEndPoint)_tcpListener.LocalEndpoint).Port;

                Thread serverThread = new Thread(ListenLoop);
                serverThread.IsBackground = true;
                serverThread.Start();
            }
            catch (Exception ex)
            {
                ShowError(
                    "Failed to bind local application port:\n\n" + ex.Message + "\n\nPlease ensure loopback networking (127.0.0.1) is permitted.",
                    "Tunnelapp 1.0 - Network Error"
                );
                return;
            }

            string appUrl = "http://127.0.0.1:" + _port + "/";

            // 3. Launch desktop window
            LaunchBrowser(appUrl);

            // 4. Robust watchdog: keep process alive while the window is active
            // Initial grace period of 35 seconds allows the browser to open and load assets
            while (_running)
            {
                Thread.Sleep(1000);
                if ((DateTime.UtcNow - _startTime).TotalSeconds > 35)
                {
                    // If no requests or heartbeat pings received for 20 seconds, browser window is closed
                    if ((DateTime.UtcNow - _lastActivity).TotalSeconds > 20)
                    {
                        break;
                    }
                }
            }

            _running = false;
            try { _tcpListener.Stop(); } catch { }
        }

        private static bool LoadEmbeddedBundle()
        {
            try
            {
                Assembly assembly = Assembly.GetExecutingAssembly();
                Stream stream = assembly.GetManifestResourceStream("TunnelappAssets");
                if (stream == null)
                {
                    string[] names = assembly.GetManifestResourceNames();
                    foreach (string name in names)
                    {
                        if (name.EndsWith("app_assets.bundle", StringComparison.OrdinalIgnoreCase) ||
                            name.IndexOf("TunnelappAssets", StringComparison.OrdinalIgnoreCase) >= 0 ||
                            name.IndexOf("assets.bundle", StringComparison.OrdinalIgnoreCase) >= 0)
                        {
                            stream = assembly.GetManifestResourceStream(name);
                            break;
                        }
                    }
                }

                if (stream == null) return false;

                using (BinaryReader reader = new BinaryReader(stream))
                {
                    byte[] magic = reader.ReadBytes(4);
                    if (magic.Length < 4 ||
                        magic[0] != (byte)'T' || magic[1] != (byte)'A' ||
                        magic[2] != (byte)'P' || magic[3] != (byte)'P')
                    {
                        return false;
                    }

                    int version = reader.ReadInt32();
                    int fileCount = reader.ReadInt32();

                    for (int i = 0; i < fileCount; i++)
                    {
                        ushort pathLen = reader.ReadUInt16();
                        byte[] pathBytes = reader.ReadBytes(pathLen);
                        string relPath = Encoding.UTF8.GetString(pathBytes);

                        uint rawSize = reader.ReadUInt32();
                        uint compSize = reader.ReadUInt32();

                        byte[] compData = reader.ReadBytes((int)compSize);
                        byte[] rawData = new byte[rawSize];

                        using (MemoryStream ms = new MemoryStream(compData))
                        using (DeflateStream ds = new DeflateStream(ms, CompressionMode.Decompress))
                        {
                            int totalRead = 0;
                            while (totalRead < rawSize)
                            {
                                int read = ds.Read(rawData, totalRead, (int)rawSize - totalRead);
                                if (read == 0) break;
                                totalRead += read;
                            }
                        }

                        string normFwd = relPath.Replace('\\', '/');
                        string normBack = relPath.Replace('/', '\\');
                        _memoryFiles[normFwd] = rawData;
                        _memoryFiles[normBack] = rawData;
                    }
                }

                return _memoryFiles.ContainsKey("index.html");
            }
            catch
            {
                return false;
            }
        }

        private static void LoadDiskFiles(string dir)
        {
            try
            {
                string[] files = Directory.GetFiles(dir, "*.*", SearchOption.AllDirectories);
                foreach (string f in files)
                {
                    string rel = f.Substring(dir.Length).TrimStart('\\', '/');
                    byte[] bytes = File.ReadAllBytes(f);
                    _memoryFiles[rel.Replace('\\', '/')] = bytes;
                    _memoryFiles[rel.Replace('/', '\\')] = bytes;
                }
            }
            catch { }
        }

        private static string LocateWebRoot(string startDir)
        {
            string[] possiblePaths = new string[]
            {
                Path.Combine(startDir, "dist"),
                Path.Combine(startDir, "..", "dist"),
                Path.Combine(startDir, "resources", "dist"),
                startDir
            };

            foreach (string p in possiblePaths)
            {
                if (Directory.Exists(p) && File.Exists(Path.Combine(p, "index.html")))
                {
                    return Path.GetFullPath(p);
                }
            }
            return null;
        }

        private static void ListenLoop()
        {
            while (_running)
            {
                try
                {
                    TcpClient client = _tcpListener.AcceptTcpClient();
                    ThreadPool.QueueUserWorkItem(HandleClient, client);
                }
                catch
                {
                    if (!_running) break;
                }
            }
        }

        private static void HandleClient(object state)
        {
            TcpClient client = (TcpClient)state;
            client.NoDelay = true;
            try
            {
                using (NetworkStream stream = client.GetStream())
                {
                    byte[] buffer = new byte[8192];
                    int bytesRead = stream.Read(buffer, 0, buffer.Length);
                    if (bytesRead <= 0) return;

                    string requestText = Encoding.ASCII.GetString(buffer, 0, bytesRead);
                    string[] lines = requestText.Split(new string[] { "\r\n" }, StringSplitOptions.None);
                    if (lines.Length == 0) return;

                    string[] parts = lines[0].Split(' ');
                    if (parts.Length < 2) return;

                    string rawUrl = parts[1];
                    _lastActivity = DateTime.UtcNow;

                    int qIdx = rawUrl.IndexOf('?');
                    if (qIdx >= 0) rawUrl = rawUrl.Substring(0, qIdx);

                    string cleanPath = rawUrl.TrimStart('/');
                    if (string.IsNullOrEmpty(cleanPath)) cleanPath = "index.html";

                    // Heartbeat ping from index.html
                    if (cleanPath.Equals("api/ping", StringComparison.OrdinalIgnoreCase))
                    {
                        byte[] ok = Encoding.ASCII.GetBytes("HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: 2\r\nConnection: close\r\n\r\nOK");
                        stream.Write(ok, 0, ok.Length);
                        return;
                    }

                    // Graceful shutdown signal from window beforeunload
                    if (cleanPath.Equals("api/shutdown", StringComparison.OrdinalIgnoreCase))
                    {
                        byte[] bye = Encoding.ASCII.GetBytes("HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: 2\r\nConnection: close\r\n\r\nOK");
                        stream.Write(bye, 0, bye.Length);
                        new Thread(() => { Thread.Sleep(800); _running = false; }).Start();
                        return;
                    }

                    byte[] data = null;
                    if (!_memoryFiles.TryGetValue(cleanPath, out data))
                    {
                        string alt = cleanPath.Replace('/', '\\');
                        if (!_memoryFiles.TryGetValue(alt, out data))
                        {
                            // SPA routing fallback
                            if (!Path.HasExtension(cleanPath))
                            {
                                _memoryFiles.TryGetValue("index.html", out data);
                            }
                        }
                    }

                    if (data != null)
                    {
                        string mime = GetMimeType(cleanPath);
                        string header = string.Format(
                            "HTTP/1.1 200 OK\r\nContent-Type: {0}\r\nContent-Length: {1}\r\nCache-Control: no-cache\r\nAccess-Control-Allow-Origin: *\r\nConnection: close\r\n\r\n",
                            mime, data.Length
                        );
                        byte[] hBytes = Encoding.ASCII.GetBytes(header);
                        stream.Write(hBytes, 0, hBytes.Length);
                        stream.Write(data, 0, data.Length);
                    }
                    else
                    {
                        byte[] notFound = Encoding.ASCII.GetBytes("HTTP/1.1 404 Not Found\r\nContent-Type: text/plain\r\nContent-Length: 9\r\nConnection: close\r\n\r\nNot Found");
                        stream.Write(notFound, 0, notFound.Length);
                    }
                }
            }
            catch { }
            finally
            {
                try { client.Close(); } catch { }
            }
        }

        private static void LaunchBrowser(string url)
        {
            string profileDir = Path.Combine(
                Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
                "Tunnelapp1.0", "Profile"
            );
            try { if (!Directory.Exists(profileDir)) Directory.CreateDirectory(profileDir); } catch { }

            // 1. Try Microsoft Edge in standalone app-mode window
            string[] edgePaths = new string[]
            {
                Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86), "Microsoft\\Edge\\Application\\msedge.exe"),
                Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles), "Microsoft\\Edge\\Application\\msedge.exe"),
                Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "Microsoft\\Edge\\Application\\msedge.exe")
            };

            foreach (string edge in edgePaths)
            {
                if (File.Exists(edge))
                {
                    try
                    {
                        ProcessStartInfo psi = new ProcessStartInfo();
                        psi.FileName = edge;
                        psi.Arguments = string.Format("--app=\"{0}\" --window-size=1280,850 --user-data-dir=\"{1}\" --no-first-run --no-default-browser-check", url, profileDir);
                        psi.UseShellExecute = false;
                        Process.Start(psi);
                        return;
                    }
                    catch { }
                }
            }

            // 2. Try Google Chrome in standalone app-mode window
            string[] chromePaths = new string[]
            {
                Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles), "Google\\Chrome\\Application\\chrome.exe"),
                Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86), "Google\\Chrome\\Application\\chrome.exe"),
                Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "Google\\Chrome\\Application\\chrome.exe")
            };

            foreach (string chrome in chromePaths)
            {
                if (File.Exists(chrome))
                {
                    try
                    {
                        ProcessStartInfo psi = new ProcessStartInfo();
                        psi.FileName = chrome;
                        psi.Arguments = string.Format("--app=\"{0}\" --window-size=1280,850 --user-data-dir=\"{1}\" --no-first-run --no-default-browser-check", url, profileDir);
                        psi.UseShellExecute = false;
                        Process.Start(psi);
                        return;
                    }
                    catch { }
                }
            }

            // 3. Fallback to system default browser
            try
            {
                Process.Start(url);
            }
            catch (Exception ex)
            {
                ShowWarning(
                    "Could not launch browser automatically.\n\nPlease open your web browser and navigate to:\n" + url + "\n\nError: " + ex.Message,
                    "Tunnelapp 1.0 - Browser Error"
                );
            }
        }

        private static string GetMimeType(string path)
        {
            string ext = Path.GetExtension(path).ToLowerInvariant();
            switch (ext)
            {
                case ".html": return "text/html; charset=utf-8";
                case ".js":
                case ".mjs": return "application/javascript; charset=utf-8";
                case ".css": return "text/css; charset=utf-8";
                case ".json": return "application/json; charset=utf-8";
                case ".svg": return "image/svg+xml";
                case ".png": return "image/png";
                case ".jpg":
                case ".jpeg": return "image/jpeg";
                case ".ico": return "image/x-icon";
                case ".woff": return "font/woff";
                case ".woff2": return "font/woff2";
                case ".ttf": return "font/ttf";
                case ".wasm": return "application/wasm";
                case ".webp": return "image/webp";
                default: return "application/octet-stream";
            }
        }
    }
}
