import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score
import joblib
import os

# 1. Load Dataset
print("Loading dataset: backend/dbms_ml.csv")
try:
    df = pd.read_csv("backend/dbms_ml.csv")
except FileNotFoundError:
    # If running from inside backend folder
    df = pd.read_csv("dbms_ml.csv")

print("Columns identified:", df.columns.tolist())

# 2. Preprocessing
# Convert Attrition to binary (1 for Yes, 0 for No)
df['Attrition_Binary'] = df['Attrition'].apply(lambda x: 1 if x == 'Yes' else 0)

# Select features: MonthlyIncome and PerformanceRating
# These map to 'salary' and 'score' in the database
X = df[['MonthlyIncome', 'PerformanceRating']]
y = df['Attrition_Binary']

# 3. Handle missing values if any
X = X.fillna(X.mean())

# 4. Train/Test Split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# 5. Model Training
print("Training Logistic Regression Model...")
model = LogisticRegression()
model.fit(X_train, y_train)

# 6. Evaluation
predictions = model.predict(X_test)
accuracy = accuracy_score(y_test, predictions)
print(f"Model Accuracy Score: {accuracy * 100:.2f}%")

# 7. Save Model
model_filename = "backend/attrition_model.pkl"
# Check path
if not os.path.exists("backend"):
    model_filename = "attrition_model.pkl"

joblib.dump(model, model_filename)
print(f"Model saved successfully as: {model_filename}")
