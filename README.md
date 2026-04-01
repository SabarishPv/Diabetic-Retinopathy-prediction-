# Diabetic-Retinopathy-prediction-
Upload retinal image and predicts diabetic retinopathy stage.
# RetinaScan DR — Diabetic Retinopathy Detection System

## Abstract

RetinaScan DR is a web-based medical imaging analysis system that automatically detects and classifies diabetic retinopathy (DR) in retinal fundus photographs. The application leverages a deep learning model trained on the APTOS 2019 dataset to stratify retinal images across five clinical severity stages, providing clinicians and researchers with rapid, standardized assessments of DR progression.

The system delivers real-time predictions via a modern, responsive interface with comprehensive confidence metrics and per-class probability breakdowns, enabling data-driven screenings and follow-up decision support.

---

## Project Overview

### Purpose
RetinaScan DR automates the detection of diabetic retinopathy from digital retinal images. Diabetic retinopathy is a leading cause of vision loss in working-age adults. This system accelerates screening workflows, improves consistency, and supports early intervention by providing objective, quantified severity assessments.

### Key Capabilities
- **Multi-stage Classification**: Categorizes retinal images into 5 clinically meaningful DR severity grades
- **Confidence-driven Results**: Reports prediction confidence and full probability distribution across all classes
- **Real-time Analysis**: Sub-second inference on uploaded fundus images
- **Intuitive Interface**: Clean, modern web UI with drag-and-drop image upload and visual result presentation
- **Robust Error Handling**: Validates file types, manages model loading failures, and provides clear error feedback

---

## Technical Architecture

### Backend Stack
- **Framework**: Flask 3.0.3
- **Model Runtime**: TensorFlow 2.16.2 (with Metal GPU acceleration support on macOS)
- **Image Processing**: Pillow 10.3.0, NumPy 1.26.4
- **Deployment**: Local HTTP server (127.0.0.1:8080) with debug mode disabled

### Frontend Stack
- **Language**: Vanilla JavaScript (no dependencies)
- **Styling**: Modern CSS3 with custom animations and responsive design
- **Features**: Drag-and-drop file upload, real-time image preview, interactive result visualization

### Model Details
- **Architecture**: EfficientNetB0 with transfer learning
- **Pre-training**: ImageNet
- **Input Size**: 224×224 RGB images
- **Training Dataset**: APTOS 2019 Blindness Detection competition dataset
- **Validation Accuracy**: ~78–79%
- **Model Files**: 
  - `dr_model_final.h5` (primary)
  - `dr_model_final.keras` (alternative)

---

## Classification System

The model outputs predictions across **5 severity classes**:

| Class | Stage | Description |
|-------|-------|-------------|
| **0** | No DR | No signs of diabetic retinopathy detected |
| **1** | Mild | Mild non-proliferative diabetic retinopathy |
| **2** | Moderate | Moderate non-proliferative diabetic retinopathy |
| **3** | Severe | Severe non-proliferative diabetic retinopathy |
| **4** | Proliferative DR | Proliferative diabetic retinopathy — advanced stage |

Each prediction includes:
- **Predicted Class**: The highest-confidence severity stage
- **Confidence Score**: Probability of the predicted class (0–100%)
- **Class Description**: Clinical interpretation for context
- **All Confidences**: Complete probability breakdown for each of the 5 classes

---

## System Workflow

### 1. Image Input
- User uploads a retinal fundus photograph via browser
- Supported formats: PNG, JPG, JPEG
- Client-side validation ensures file type compliance
- Real-time preview displayed to user

### 2. Processing Pipeline
```
Image Upload 
  → Secure File Storage (uploads/)
  → Model Loading (lazy-loaded on first request)
  → Preprocessing:
      - Resize to 224×224
      - Convert to array
      - DenseNet/EfficientNet normalization
  → Forward Pass through Model
```

### 3. Prediction Generation
- Model outputs 5-element probability vector
- Argmax selection identifies highest-confidence class
- **All 5 class probabilities** returned for transparency
- Confidence percentages computed and rounded to 2 decimal places

### 4. Result Presentation
- **Loading State**: "Scanning retinal patterns…" visual feedback
- **Success State**: 
  - Diagnosed severity stage with clinical description
  - Confidence bar (visual progress indicator)
  - Class probability matrix showing all predictions
- **Error State**: Clear error messaging for validation/processing failures

---

## File Structure

```
DR_App/
├── app.py                          # Flask application & routing
├── inference.py                    # Model loading & prediction logic
├── check.py                        # Model validation utility
├── requirements.txt                # Python dependencies
├── saved_models/
│   ├── dr_model_final.h5          # Trained model (HDF5 format)
│   └── dr_model_final.keras       # Trained model (Keras format)
├── templates/
│   └── index.html                 # Main UI template
├── static/
│   ├── css/
│   │   └── style.css              # Styling & animations
│   └── js/
│       └── app.js                 # Client-side logic
├── uploads/                        # Temporary uploaded image storage
└── venv311/                        # Python virtual environment

```

---

## Installation & Setup

### Prerequisites
- Python 3.11+
- macOS (or Linux) — TensorFlow Metal support optimized for Apple Silicon
- Browser with JavaScript enabled

### 1. Clone/Download the Project
```bash
cd DR_App
```

### 2. Activate Virtual Environment
```bash
source venv311/bin/activate
```

### 3. Install Dependencies (if needed)
```bash
pip install -r requirements.txt
```

### 4. Run the Application
```bash
python app.py
```

**Expected Output:**
```
[INFO] TensorFlow version: 2.16.2
[INFO] Loading model...
[INFO] Model loaded successfully.
 * Running on http://127.0.0.1:8080
```

### 5. Access the Web Interface
Open your browser and navigate to:
```
http://127.0.0.1:8080
```

---

## API Endpoints

### `GET /`
Returns the main HTML interface.

**Response:** HTML page with embedded UI

---

### `POST /predict`
Analyzes an uploaded retinal image and returns DR severity prediction.

**Request:**
```
Content-Type: multipart/form-data
Body: { file: <binary image file> }
```

**Success Response (200):**
```json
{
  "predicted_class": "Mild",
  "class_index": 1,
  "confidence": 87.45,
  "description": "Mild non-proliferative diabetic retinopathy.",
  "all_confidences": {
    "No DR": 5.23,
    "Mild": 87.45,
    "Moderate": 6.12,
    "Severe": 1.15,
    "Proliferative DR": 0.05
  }
}
```

**Error Response (400/500):**
```json
{
  "error": "Invalid file type. Use PNG or JPG."
}
```

---

## User Interface Details

### Upload Panel
- **Drag-and-drop zone** with visual feedback
- **Browse button** for traditional file selection
- **Real-time image preview** after selection
- **Clear button** to reset and upload a different image
- **Analyze button** (enabled only when image selected)

### Result Panel
- **Idle State**: Awaiting image for analysis
- **Loading State**: Animated scan bar with "Scanning retinal patterns…" message
- **Result State**: 
  - Large diagnosed severity stage display
  - Clinical description text
  - Confidence percentage and visual bar
  - Breakdown table showing all 5 class probabilities with color coding
- **Error State**: Error icon and descriptive message

### Visual Design
- Modern dark theme with neon accent colors
- **Severity Color Palette**:
  - Grade 0 (No DR): Cyan (`#00c8b4`)
  - Grade 1 (Mild): Green (`#7bc86c`)
  - Grade 2 (Moderate): Orange (`#f0a500`)
  - Grade 3 (Severe): Deep Orange (`#f06a00`)
  - Grade 4 (Proliferative): Red (`#ff4d6d`)
- Custom scanline animations and pulsing elements
- Responsive design for desktop and tablet viewing
- Typography: "DM Mono" for technical elements, "Syne" for headers

---

## Error Handling & Resilience

### Model Loading Fallbacks
The system implements a **3-tiered model loading strategy** to handle TensorFlow/Keras version mismatches:
1. Standard `load_model()` call
2. Fallback with `compile=False` (skips optimizer restoration)
3. Fallback with `safe_mode=False` (disables validation)

If all attempts fail, detailed error messages guide users to update TensorFlow:
```bash
pip install --upgrade tensorflow-macos tensorflow-metal
```

### Input Validation
- File extension checking (PNG, JPG, JPEG)
- MIME type validation on client and server
- Secure filename generation to prevent path traversal attacks
- File presence validation before processing

### Network Error Handling
- Client-side timeout handling for slow predictions
- Informative error message if Flask server is unreachable
- Graceful fallback messages for various failure modes

---

## Configuration

### Server Settings
- **Host**: `127.0.0.1` (localhost only — secure for development)
- **Port**: `8080` (configurable in `app.py`)
- **Debug Mode**: `False` (disabled for production)
- **Upload Folder**: `uploads/` (automatically created if missing)

### Model Configuration
- **Model Path**: `saved_models/dr_model_final.h5`
- **Input Size**: `224×224` (resized by TensorFlow preprocessing)
- **Normalization**: DenseNet/EfficientNet standard scaling

### File Size Limits
- Default Werkzeug limit: 16 MB per upload
- Configurable via `app.config['MAX_CONTENT_LENGTH']` if needed

---

## Limitations & Disclaimers

⚠️ **Important**: This system is **for research and screening support use only**, not for clinical diagnostic determination.

### Known Limitations
- **Accuracy**: ~78–79% on APTOS 2019 validation set — not 100%
- **Input Requirements**: Requires clear, well-focused fundus photographs
- **Demographic Bias**: Model performance may vary across different populations if training data was not representative
- **Image Quality Sensitivity**: Blurry, poorly-captured, or non-standard images may yield unreliable predictions
- **Single-Image Assessment**: Does not incorporate patient history, longitudinal trends, or clinical context
- **Single Modality**: Only analyzed retinal fundus photos; does not assess other imaging modalities

### Clinical Considerations
- Predictions should be **validated by qualified eye care professionals**
- System is **not a replacement for comprehensive ophthalmic examination**
- False negatives could miss early-stage DR; false positives could trigger unnecessary referrals
- Results are **one data point in a complete screening workflow**, not a standalone diagnosis

---

## Performance Characteristics

### Inference Speed
- **Model Loading**: ~2–4 seconds (first request only, cached thereafter)
- **Per-Image Prediction**: ~200–400 ms on Apple Silicon Mac
- **End-to-End Response Time**: ~500 ms – 1 second (including preprocessing and network latency)

### Memory Requirements
- **Model Size**: ~30–50 MB (in-memory after loading)
- **Minimum RAM**: 2 GB
- **Recommended RAM**: 4 GB+

### GPU Acceleration
- **Apple Silicon**: TensorFlow Metal automatically enables GPU compute on compatible Macs
- **Other Platforms**: Install TensorFlow-GPU variants for CUDA/cuDNN acceleration

---

## Development & Deployment Notes

### Local Testing
```bash
# Activate environment
source venv311/bin/activate

# Run server
python app.py

# In another terminal, test the API
curl -F "file=@path/to/retinal_image.jpg" http://127.0.0.1:8080/predict
```

### Browser Compatibility
- Modern browsers (Chrome, Firefox, Safari, Edge) with ES6+ support
- No external dependencies required

### Security Considerations
- Sanitized file uploads with `secure_filename()`
- No file persistence after server restart
- CORS disabled (single-origin, local deployment)
- Model runs locally; no cloud API calls
- No user data logging or transmission

### Scaling Recommendations
For production deployment, consider:
- **Containerization**: Docker image for consistent environments
- **Model Serving**: Use TensorFlow Serving or TorchServe for multi-request queuing
- **Load Balancing**: Reverse proxy (Nginx) with multiple Flask workers
- **Asynchronous Processing**: Celery + Redis for high-volume batch predictions
- **Database**: PostgreSQL/MongoDB for result logging and user management

---

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| Flask | 3.0.3 | Web framework & routing |
| TensorFlow-macOS | 2.16.2 | Deep learning inference |
| TensorFlow-Metal | 1.1.0 | GPU acceleration (Apple Silicon) |
| NumPy | 1.26.4 | Numerical computation |
| Pillow | 10.3.0 | Image processing |
| Werkzeug | 3.0.3 | WSGI utilities & file handling |

---

## Citation & Attribution

- **Dataset**: APTOS 2019 Blindness Detection (Kaggle)
- **Architecture**: EfficientNetB0 with ImageNet pre-training
- **Framework**: TensorFlow/Keras
- **UI Inspiration**: Modern medical dashboard design principles

---

## License & Disclaimer

This project is provided "as-is" for research and educational purposes. Creators assume no liability for medical decisions made based on this system's output. Always consult qualified medical professionals for clinical assessments.

---

## Support

### Troubleshooting

**Issue**: Model fails to load with version error
```
All load attempts failed...
```
**Solution**:
```bash
pip install --upgrade tensorflow-macos tensorflow-metal
```

**Issue**: Port 8080 already in use
**Solution**: Change port in `app.py` line 47:
```python
app.run(debug=False, host="127.0.0.1", port=8081)  # Use different port
```

**Issue**: Image upload fails silently
**Solution**: Check browser console (F12) for network errors; ensure Flask server is running and accessible at http://127.0.0.1:8080

---

## Contributing
For bug reports or improvements, document the issue and include:
- Environment (OS, Python version, TensorFlow version)
- Image file details (size, format)
- Full error message from server logs

---

**Last Updated**: April 2026  
**Maintained by**: DR_App Team  
**Version**: 1.0.0
