import numpy as np
import os
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"


MODEL_PATH = "saved_models/dr_model_final.h5"

CLASS_LABELS = {
    0: "No DR",
    1: "Mild",
    2: "Moderate",
    3: "Severe",
    4: "Proliferative DR"
}

CLASS_DESCRIPTIONS = {
    0: "No signs of diabetic retinopathy detected.",
    1: "Mild non-proliferative diabetic retinopathy.",
    2: "Moderate non-proliferative diabetic retinopathy.",
    3: "Severe non-proliferative diabetic retinopathy.",
    4: "Proliferative diabetic retinopathy — advanced stage."
}

_model = None


def get_model():
    global _model
    if _model is None:
        import tensorflow as tf
        print(f"[INFO] TensorFlow version: {tf.__version__}")
        print("[INFO] Loading model...")

        try:
            # Try standard load first
            _model = tf.keras.models.load_model(MODEL_PATH)
            print("[INFO] Model loaded successfully.")
        except Exception as e1:
            print(f"[WARN] Standard load failed: {e1}")
            try:
                # Fallback: load with compile=False (skips optimizer mismatch)
                _model = tf.keras.models.load_model(MODEL_PATH, compile=False)
                print("[INFO] Model loaded with compile=False.")
            except Exception as e2:
                print(f"[WARN] compile=False failed: {e2}")
                try:
                    # Fallback: load with safe_mode disabled
                    _model = tf.keras.models.load_model(
                        MODEL_PATH, safe_mode=False)
                    print("[INFO] Model loaded with safe_mode=False.")
                except Exception as e3:
                    raise RuntimeError(
                        f"All load attempts failed.\n"
                        f"Attempt 1: {e1}\n"
                        f"Attempt 2: {e2}\n"
                        f"Attempt 3: {e3}\n\n"
                        "Your model was likely saved with a different Keras version. "
                        "Run: pip install --upgrade tensorflow-macos tensorflow-metal"
                    )
    return _model


def predict_image(image_path: str) -> dict:
    import tensorflow as tf

    model = get_model()

    img = tf.keras.preprocessing.image.load_img(
        image_path, target_size=(224, 224))
    img_array = tf.keras.preprocessing.image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)

    # DenseNet preprocessing: scale to [0,1] then normalize
    img_array = tf.keras.applications.densenet.preprocess_input(img_array)

    predictions = model.predict(img_array, verbose=0)[0]
    predicted_class = int(np.argmax(predictions))
    confidence = float(predictions[predicted_class]) * 100

    all_confidences = {
        CLASS_LABELS[i]: round(float(predictions[i]) * 100, 2)
        for i in range(5)
    }

    return {
        "predicted_class": CLASS_LABELS[predicted_class],
        "class_index": predicted_class,
        "confidence": round(confidence, 2),
        "description": CLASS_DESCRIPTIONS[predicted_class],
        "all_confidences": all_confidences
    }
