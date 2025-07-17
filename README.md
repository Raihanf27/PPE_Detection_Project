# 🛡️ PPE Detection with YOLOv7

An intelligent application to automatically detect violations in the use of Personal Protective Equipment (PPE), such as **helmets** and **vests**, from uploaded or YouTube videos. It uses **YOLOv7** for object detection, **React** for the frontend, and **Flask** for the backend.

This project is built with a modern architecture, utilizing **Flask** as the backend to provide a REST API, and **React.js** as the frontend for an interactive and responsive user interface.

## ✨ Key Features

### 1. 🎥 Video Upload

- Supports video uploads from both local devices and YouTube links.

### 2. 🔍 PPE Detection (YOLOv7)

- Detects: `helmet`, `no-helmet`, `vest`, `no-vest`, and `person`.
- Displays bounding boxes on the processed video.

### 3. 📊 Real-Time Violation Statistics

- Displays live count of `no-helmet` and `no-vest` detections in the UI.

### 4. 🔔 Real-Time Notifications

- Automatic toast notifications for each `no-helmet` or `no-vest` detection.

### 5. 🌙 Dark & Light Theme

- Toggle between dark and light modes (persisted via `localStorage`).

---

## ⚙️ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/username/ppe-detection-yolov7.git
cd ppe-detection-yolov7
```

### 2. Backend Flask

```bash
cd backend
pip install -r requirements.txt
python app.py
```

### 3. Frontend React

```bash
cd frontend
npm install
npm start
```

# Upload from YouTube

Paste a YouTube video URL in the form and click "Upload from YouTube". The backend will automatically download the video and process it for PPE detection.

# Project Structure

```bash
ppe-detection-yolov7/
├── backend/
│   ├── app.py               # Flask API
│   ├── yolov7/              # YOLOv7 source code
│   ├── weights/best.pt      # Trained detection model
│   └── uploads/             # Video storage directory
└── frontend/
    ├── public/
    ├── src/
    │   ├── App.js           # Main React frontend
    │   └── App.css          # App styling
```

# Cara Menggunakan

- Start Flask backend:
  ```bash
  python app.py
  ```
- Jalankan frontend: npm start
  ```bash
  npm start
  ```
- Upload a video or paste a YouTube link.
- Watch live detection results and statistics.

# Catatan Tambahan

- The model format follows YOLOv7 standards.
- Compatible with CUDA (GPU) or CPU.
- Make sure yt-dlp is installed to support YouTube video downloads.

Screenshoots:
![alt text](<Screenshot (21).png>)

![alt text](<Screenshot (22).png>)
