from flask import Blueprint, request, jsonify
from db import execute_query, get_connection
from mysql.connector import Error

task_bp = Blueprint('task', __name__)

@task_bp.route('/tasks', methods=['GET'])
def get_tasks():
    """Fetch all tasks from existing table."""
    results = execute_query("SELECT * FROM Task")
    if results is None:
        return jsonify({"error": "Failed to fetch tasks"}), 500
    return jsonify(results), 200

@task_bp.route('/tasks', methods=['POST'])
def add_task():
    """Assign new task."""
    data = request.get_json()
    if not data or 'employee_id' not in data or 'task_name' not in data or 'status' not in data:
        return jsonify({"error": "Missing task data"}), 400

    conn = get_connection()
    try:
        cursor = conn.cursor(dictionary=True)
        query = "INSERT INTO Task (employee_id, task_name, status) VALUES (%s, %s, %s)"
        cursor.execute(query, (data['employee_id'], data['task_name'], data['status']))
        conn.commit()
        return jsonify({"task_id": cursor.lastrowid, "message": "Task assigned"}), 201
    except Error as e:
        if e.errno == 1452:
            return jsonify({"error": "Deployment Failed: Target Operative does not exist in central database."}), 400
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()
