const fileInput = document.getElementById('fileInput');
const dropZone = document.getElementById('dropZone');
const previewArea = document.getElementById('previewArea');
const previewImg = document.getElementById('previewImg');
const clearBtn = document.getElementById('clearBtn');
const analyzeBtn = document.getElementById('analyzeBtn');
const idleState = document.getElementById('idleState');
const loadingState = document.getElementById('loadingState');
const resultContent = document.getElementById('resultContent');
const errorState = document.getElementById('errorState');

// Severity color palette
const SEVERITY_COLORS = ['#00c8b4', '#7bc86c', '#f0a500', '#f06a00', '#ff4d6d'];

let selectedFile = null;

// ── File selection ──────────────────────────────────────────────
dropZone.addEventListener('click', () => fileInput.click());

dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
});
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
});

fileInput.addEventListener('change', () => {
    if (fileInput.files[0]) handleFile(fileInput.files[0]);
});

function handleFile(file) {
    const allowed = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!allowed.includes(file.type)) {
        alert('Please upload a PNG or JPG image.');
        return;
    }
    selectedFile = file;
    const reader = new FileReader();
    reader.onload = (e) => {
        previewImg.src = e.target.result;
        previewArea.style.display = 'block';
        dropZone.style.display = 'none';
        analyzeBtn.disabled = false;
    };
    reader.readAsDataURL(file);
    resetResult();
}

clearBtn.addEventListener('click', () => {
    selectedFile = null;
    fileInput.value = '';
    previewArea.style.display = 'none';
    dropZone.style.display = 'block';
    analyzeBtn.disabled = true;
    resetResult();
});

// ── Analyze ─────────────────────────────────────────────────────
analyzeBtn.addEventListener('click', async () => {
    if (!selectedFile) return;

    showLoading();

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
        const response = await fetch('/predict', { method: 'POST', body: formData });
        const data = await response.json();

        if (!response.ok || data.error) {
            showError(data.error || 'Prediction failed.');
            return;
        }

        showResult(data);
    } catch (err) {
        showError('Network error — is the Flask server running?');
    }
});

// ── UI States ────────────────────────────────────────────────────
function resetResult() {
    idleState.style.display = 'block';
    loadingState.style.display = 'none';
    resultContent.style.display = 'none';
    errorState.style.display = 'none';
}

function showLoading() {
    idleState.style.display = 'none';
    loadingState.style.display = 'block';
    resultContent.style.display = 'none';
    errorState.style.display = 'none';
}

function showError(msg) {
    idleState.style.display = 'none';
    loadingState.style.display = 'none';
    resultContent.style.display = 'none';
    errorState.style.display = 'block';
    document.getElementById('errorMsg').textContent = msg;
}

function showResult(data) {
    idleState.style.display = 'none';
    loadingState.style.display = 'none';
    errorState.style.display = 'none';
    resultContent.style.display = 'block';

    document.getElementById('stageName').textContent = data.predicted_class;
    document.getElementById('stageDesc').textContent = data.description;
    document.getElementById('confValue').textContent = data.confidence.toFixed(1) + '%';

    // Animate confidence bar
    const bar = document.getElementById('confBarFill');
    bar.style.width = '0%';
    setTimeout(() => { bar.style.width = data.confidence + '%'; }, 50);

    // Breakdown bars
    const container = document.getElementById('breakdownBars');
    container.innerHTML = '';

    const allConf = data.all_confidences;
    const classIndex = data.class_index;

    Object.entries(allConf).forEach(([label, pct], i) => {
        const row = document.createElement('div');
        row.className = 'breakdown-row';

        const color = i === classIndex ? SEVERITY_COLORS[i] : 'rgba(255,255,255,0.15)';

        row.innerHTML = `
      <span class="breakdown-name">${label}</span>
      <div class="breakdown-track">
        <div class="breakdown-fill" style="width:0%; background:${color}" data-width="${pct}"></div>
      </div>
      <span class="breakdown-pct">${pct.toFixed(1)}%</span>
    `;
        container.appendChild(row);
    });

    // Animate breakdown bars
    setTimeout(() => {
        document.querySelectorAll('.breakdown-fill').forEach(el => {
            el.style.width = el.dataset.width + '%';
        });
    }, 100);
}