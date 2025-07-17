from flask import Flask, request, jsonify, Response, send_from_directory
from flask_cors import CORS
import torch
import cv2
import numpy as np
import os
import uuid
from werkzeug.utils import secure_filename
import yt_dlp
import sys

sys.path.append(os.path.join(os.getcwd(), 'yolov7'))
from yolov7.utils.datasets import letterbox
from yolov7.models.experimental import attempt_load
from yolov7.utils.general import non_max_suppression, scale_coords
from yolov7.utils.plots import plot_one_box

app = Flask(__name__)
CORS(app)
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

device = 'cuda' if torch.cuda.is_available() else 'cpu'
model = attempt_load('weights/best.pt', map_location=device)
model.to(device).eval()

class_names = ['vest', 'no-vest', 'helmet', 'no-helmet', 'person']

latest_video_path = None
latest_detections = []

@app.route('/upload', methods=['POST'])
def upload():
    global latest_video_path
    if 'video' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    file = request.files['video']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    filename = secure_filename(file.filename)
    unique_name = f"{uuid.uuid4()}_{filename}"
    path = os.path.join(UPLOAD_FOLDER, unique_name)
    file.save(path)
    latest_video_path = path
    return jsonify({'message': 'Uploaded successfully'})

@app.route('/upload_youtube', methods=['POST'])
def upload_youtube():
    global latest_video_path
    data = request.get_json()
    url = data.get('url')
    if not url:
        return jsonify({'error': 'No URL provided'}), 400

    try:
        filename = f"{uuid.uuid4()}.mp4"
        output_path = os.path.join(UPLOAD_FOLDER, filename)
        ydl_opts = {
            'outtmpl': output_path,
            'format': 'best[ext=mp4]',
        }
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([url])
        latest_video_path = output_path
        return jsonify({'message': 'YouTube video downloaded successfully'})
    except Exception as e:
        return jsonify({'error': f'Failed to download: {str(e)}'}), 500

@app.route('/stream')
def stream():
    def generate():
        global latest_detections
        cap = cv2.VideoCapture(latest_video_path)
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break

            img, ratio, pad = letterbox(frame, new_shape=640)
            img = img[:, :, ::-1].transpose(2, 0, 1)
            img = np.ascontiguousarray(img)
            img_tensor = torch.from_numpy(img).float().to(device) / 255.0
            img_tensor = img_tensor.unsqueeze(0)

            with torch.no_grad():
                pred = model(img_tensor)[0]
                pred = non_max_suppression(pred, conf_thres=0.25, iou_thres=0.45)

            latest_detections = []

            for det in pred:
                if len(det):
                    det[:, :4] = scale_coords(img_tensor.shape[2:], det[:, :4], frame.shape).round()
                    for *xyxy, conf, cls in det:
                        class_id = int(cls)
                        label = class_names[class_id]
                        if label in ['no-vest', 'no-helmet']:
                            latest_detections.append(label)
                        color = (0, 0, 255) if label.startswith('no-') else (0, 255, 0)
                        plot_one_box(xyxy, frame, label=f"{label} {conf:.2f}", color=color, line_thickness=2)

            _, buffer = cv2.imencode('.jpg', frame)
            yield (b'--frame\r\nContent-Type: image/jpeg\r\n\r\n' + buffer.tobytes() + b'\r\n')
        cap.release()

    return Response(generate(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/detections')
def get_detections():
    return jsonify(latest_detections)

@app.route('/uploads/<path:filename>')
def serve_file(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
