from flask import Blueprint, jsonify
from db import execute_query

performance_bp = Blueprint('performance', __name__)

@performance_bp.route('/performance', methods=['GET'])
def get_performance():
    """Fetch all performance data from existing table."""
    results = execute_query("SELECT * FROM Performance")
    if results is None:
        return jsonify({"error": "Failed to fetch performance data"}), 500
    return jsonify(results), 200

@performance_bp.route('/performance/<int:employee_id>', methods=['PUT', 'POST'])
def update_performance(employee_id):
    """Update or insert performance score for an employee."""
    from flask import request
    data = request.get_json()
    if not data or 'score' not in data:
        return jsonify({"error": "Missing score data"}), 400
    
    score = data['score']
    
    # Check if record exists
    check = execute_query("SELECT * FROM Performance WHERE employee_id = %s", (employee_id,))
    
    if check:
        # Update
        query = "UPDATE Performance SET score = %s WHERE employee_id = %s"
        params = (score, employee_id)
    else:
        # Insert
        query = "INSERT INTO Performance (employee_id, score) VALUES (%s, %s)"
        params = (employee_id, score)
        
    if execute_query(query, params, is_select=False):
        return jsonify({"message": "Performance metric updated", "score": score}), 200
    return jsonify({"error": "Failed to store intelligence metric"}), 500
