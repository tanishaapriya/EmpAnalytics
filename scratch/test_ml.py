import joblib
import os
import sys

MODEL_PATH = "backend/attrition_model.pkl"
if not os.path.exists(MODEL_PATH):
    MODEL_PATH = "attrition_model.pkl"

if not os.path.exists(MODEL_PATH):
    print("Model not found")
    sys.exit(1)

model = joblib.load(MODEL_PATH)
print("Model loaded")
try:
    # Test prediction with 2 features
    res = model.predict([[50000, 4]])
    print(f"Result: {res}")
except Exception as e:
    print(f"Error: {e}")
