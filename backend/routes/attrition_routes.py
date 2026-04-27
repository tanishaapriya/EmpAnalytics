from flask import Blueprint, jsonify
from db import execute_query, get_connection
import joblib
import os
from mysql.connector import Error

attrition_bp = Blueprint('attrition', __name__)

# Load the ML model globally
MODEL_PATH = "backend/attrition_model.pkl"
if not os.path.exists(MODEL_PATH):
    MODEL_PATH = "attrition_model.pkl" # Fallback for different run contexts

attrition_model = None
if os.path.exists(MODEL_PATH):
    try:
        attrition_model = joblib.load(MODEL_PATH)
        print(f"Attrition ML Model loaded from {MODEL_PATH}")
    except Exception as e:
        print(f"Error loading ML model: {e}")

@attrition_bp.route('/attrition', methods=['GET'])
def get_attrition():
    """Fetch all attrition data from existing table."""
    results = execute_query("SELECT * FROM Attrition_Prediction")
    if results is None:
        return jsonify({"error": "Failed to fetch attrition data"}), 500
    return jsonify(results), 200

@attrition_bp.route('/attrition/high-risk', methods=['GET'])
def get_high_risk():
    """Fetch only high-risk records using specific filter."""
    query = "SELECT * FROM Attrition_Prediction WHERE risk_level = 'High'"
    results = execute_query(query)
    if results is None:
        return jsonify({"error": "Failed to fetch high-risk data"}), 500
    return jsonify(results), 200

@attrition_bp.route('/predict/all', methods=['GET'])
def predict_all():
    """Optimized prediction for all employees."""
    if attrition_model is None:
        return jsonify({"error": "ML offline"}), 500

    query = """
        SELECT e.employee_id, e.employee_name, d.department_name as dept, e.salary, p.score
        FROM Employee e
        LEFT JOIN Department d ON e.dept_id = d.department_id
        LEFT JOIN Performance p ON e.employee_id = p.employee_id
    """
    employees = execute_query(query)
    if employees is None:
        return jsonify({"error": "DB Select Failure"}), 500

    results = []
    # Bulk process
    for emp in employees:
        salary = emp['salary'] or 40000
        raw_score = emp['score'] if emp['score'] is not None else 3
        model_score = raw_score if raw_score <= 5 else raw_score / 20
        
        try:
            # Scale salary (DB ~65k → Model ~6.5k)
            pred = attrition_model.predict([[salary / 10, model_score]])
            risk = "HIGH" if pred[0] == 1 else "LOW"
        except:
            risk = "LOW"
        
        base_score = 30 if risk == "LOW" else 75
        variance = (3 - model_score) * 8
        results.append({
            "employee_id": emp['employee_id'],
            "employee_name": emp['employee_name'],
            "dept": emp['dept'],
            "salary": salary,
            "score": raw_score,
            "level": risk,
            "riskScore": round(min(95, max(5, base_score + variance)))
        })
    
    return jsonify(results), 200

@attrition_bp.route('/predict/<int:employee_id>', methods=['GET'])
def predict_attrition(employee_id):
    """Granular prediction for a single operative."""
    if attrition_model is None:
        return jsonify({"error": "ML offline"}), 500
    query = """
        SELECT salary, (SELECT score FROM Performance WHERE employee_id = e.employee_id) as score 
        FROM Employee e WHERE employee_id = %s
    """
    res = execute_query(query, (employee_id,))
    if not res or not res[0]['score']:
        return jsonify({"error": "Data missing"}), 404
    pred = attrition_model.predict([[res[0]['salary'], res[0]['score']]])
    risk = "HIGH" if pred[0] == 1 else "LOW"
    return jsonify({"employee_id": employee_id, "predicted_risk": risk}), 200
