import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [file, setFile] = useState(null);
  const [uploaded, setUploaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paused, setPaused] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [streamUrl, setStreamUrl] = useState("http://localhost:5000/stream");
  const [stats, setStats] = useState({ "no-helmet": 0, "no-vest": 0 });
  const videoRef = useRef(null);
  const countedLabels = useRef(new Set());

  useEffect(() => {
    const savedTheme = localStorage.getItem("darkMode") === "true";
    setDarkMode(savedTheme);
    document.body.classList.toggle("dark", savedTheme);
  }, []);

  const toggleTheme = () => {
    const nextMode = !darkMode;
    setDarkMode(nextMode);
    localStorage.setItem("darkMode", nextMode);
    document.body.classList.toggle("dark", nextMode);
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setUploaded(false);
    countedLabels.current.clear();
    setStats({ "no-helmet": 0, "no-vest": 0 });
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert("Pilih video terlebih dahulu.");
    const formData = new FormData();
    formData.append("video", file);

    try {
      setLoading(true);
      const res = await axios.post("http://localhost:5000/upload", formData);
      if (res.data.message === "Uploaded successfully") {
        setUploaded(true);
        setStreamUrl(`http://localhost:5000/stream?t=${Date.now()}`);
        setPaused(false);
      }
    } catch (err) {
      alert("Gagal mengunggah video.");
    } finally {
      setLoading(false);
    }
  };

  const handleYoutubeUpload = async () => {
    if (!youtubeUrl) return alert("Masukkan URL YouTube terlebih dahulu.");
    try {
      setLoading(true);
      const res = await axios.post("http://localhost:5000/upload_youtube", {
        url: youtubeUrl,
      });
      if (res.data.message) {
        setUploaded(true);
        setStreamUrl(`http://localhost:5000/stream?t=${Date.now()}`);
        setPaused(false);
      }
    } catch (err) {
      alert("Gagal mengunggah dari YouTube.");
    } finally {
      setLoading(false);
    }
  };

  const handlePauseToggle = () => {
    if (paused) {
      setStreamUrl(`http://localhost:5000/stream?t=${Date.now()}`);
    }
    setPaused(!paused);
  };

  useEffect(() => {
    const interval = setInterval(async () => {
      if (!uploaded || paused) return;
      try {
        const res = await axios.get("http://localhost:5000/detections");
        const detected = res.data;
        const newStats = { ...stats };

        const unique = new Set(detected);
        unique.forEach((label) => {
          if ((label === "no-helmet" || label === "no-vest") && !countedLabels.current.has(label)) {
            newStats[label] += 1;
            countedLabels.current.add(label);
          }
        });

        setStats(newStats);
      } catch (err) {
        console.error("Gagal ambil statistik:", err);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [uploaded, paused, stats]);

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <h2 className="logo">🛡️ PPE AI</h2>
        <nav className="nav">
          <a href="#" className="nav-link active">📹 Upload</a>
          <a href="#" className="nav-link">📊 Statistik</a>
        </nav>
      </aside>

      <main className="main">
        <header className="topbar">
          <h1 className="page-title">Deteksi APD (YOLOv7)</h1>
          <button onClick={toggleTheme} className="theme-toggle">
            {darkMode ? "☀️ Light" : "🌙 Dark"}
          </button>
        </header>

        <section className="content">
          <div className="upload-card">
            <form onSubmit={handleUpload} className="form">
              <input type="file" accept="video/*" onChange={handleFileChange} />
              <button type="submit" disabled={loading}>
                {loading ? "Mengunggah..." : "⬆️ Upload Video"}
              </button>
            </form>

            <div className="youtube-upload">
              <input
                type="text"
                placeholder="Tempel link YouTube..."
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
              />
              <button onClick={handleYoutubeUpload} disabled={loading}>
                🎞️ Unggah dari YouTube
              </button>
            </div>

            {file && <p className="filename">📁 {file.name}</p>}
          </div>

          {uploaded && (
            <div className="video-card">
              <div className="video-header">
                <h2>🎯 Hasil Deteksi</h2>
                <div className="controls">
                  <button onClick={handlePauseToggle}>
                    {paused ? "▶️ Resume" : "⏸️ Pause"}
                  </button>
                </div>
              </div>
              {!paused && (
                <img
                  key={streamUrl}
                  ref={videoRef}
                  src={streamUrl}
                  alt="YOLOv7 Stream"
                  className="video"
                />
              )}

              <div className="stats">
                <h3>📊 Statistik Pelanggaran</h3>
                <p>❌ No Helmet: {stats["no-helmet"]}</p>
                <p>❌ No Vest: {stats["no-vest"]}</p>
              </div>
            </div>
          )}
        </section>

        <footer className="footer">
          🔧 Dibuat oleh Raihan & YOLOv7 • 2025
        </footer>
      </main>
    </div>
  );
}

export default App;
