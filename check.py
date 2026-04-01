from tensorflow.keras.models import load_model

model = load_model("saved_models/dr_model_final.keras")

print("Model loaded successfully")
print(model.summary())
