import tensorflow as tf

# Load your Keras model
model = tf.keras.models.load_model(
    "models/plant_disease_prediction_model.keras"
)

# Create converter
converter = tf.lite.TFLiteConverter.from_keras_model(model)

# Dynamic range quantization
converter.optimizations = [tf.lite.Optimize.DEFAULT]

# Convert
tflite_model = converter.convert()

# Save
with open("models/plant_disease_prediction_model.tflite", "wb") as f:
    f.write(tflite_model)

print("Conversion completed successfully!")