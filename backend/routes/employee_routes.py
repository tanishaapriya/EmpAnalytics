from flask import Blueprint, request, jsonify
from db import execute_query, get_connection
from mysql.connector import Error

employee_bp = Blueprint('employee', __name__)

@employee_bp.route('/departments', methods=['GET'])
def get_departments():
    """Fetch all valid departments for the operative registry."""
    results = execute_query("SELECT * FROM Department")
    if results is None:
        return jsonify({"error": "Failed to fetch department rosters"}), 500
    return jsonify(results), 200

@employee_bp.route('/employees', methods=['GET'])
def get_employees():
    """Fetch all employees using Department JOIN as requested."""
    query = """
        SELECT e.employee_id, e.employee_name, d.department_name AS dept, e.salary
        FROM Employee e
        JOIN Department d ON e.dept_id = d.department_id;
    """
    results = execute_query(query)
    if results is None:
        return jsonify({"error": "Failed to connect or fetch from existing database"}), 500
    return jsonify(results), 200

@employee_bp.route('/employees/<int:employee_id>', methods=['GET'])
def get_employee(employee_id):
    """Fetch single employee by ID."""
    query = """
        SELECT e.employee_id, e.employee_name, d.department_name AS dept, e.salary
        FROM Employee e
        JOIN Department d ON e.dept_id = d.department_id
        WHERE e.employee_id = %s;
    """
    results = execute_query(query, (employee_id,))
    if results is None:
        return jsonify({"error": "Database error"}), 500
    if not results:
        return jsonify({"error": "Operative not found"}), 404
    return jsonify(results[0]), 200

@employee_bp.route('/employees', methods=['POST'])
def add_employee():
    """Add employee by converting dept name to dept_id."""
    data = request.get_json()
    if not data or 'employee_name' not in data or 'dept' not in data or 'salary' not in data:
        return jsonify({"error": "Missing required fields (name, dept, salary)"}), 400

    # Dept Lookup
    dept_results = execute_query("SELECT department_id FROM Department WHERE department_name = %s", (data['dept'],))
    if not dept_results:
        return jsonify({"error": f"Department '{data['dept']}' not found in existing records"}), 400
    
    dept_id = dept_results[0]['department_id']

    # Insertion
    conn = get_connection()
    try:
        cursor = conn.cursor(dictionary=True)
        insert_query = "INSERT INTO Employee (employee_name, dept_id, salary) VALUES (%s, %s, %s)"
        cursor.execute(insert_query, (data['employee_name'], dept_id, data['salary']))
        conn.commit()
        new_id = cursor.lastrowid
        
        return jsonify({
            "employee_id": new_id,
            "employee_name": data['employee_name'],
            "dept": data['dept'],
            "salary": data['salary']
        }), 201
    except Error as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@employee_bp.route('/employees/<int:employee_id>', methods=['PUT'])
def update_employee(employee_id):
    """Update existing employee record."""
    data = request.get_json()
    if not data:
        return jsonify({"error": "No update data provided"}), 400

    fields = []
    values = []
    
    if 'employee_name' in data:
        fields.append("employee_name = %s")
        values.append(data['employee_name'])
    
    if 'dept' in data:
        dept_results = execute_query("SELECT department_id FROM Department WHERE department_name = %s", (data['dept'],))
        if not dept_results:
            return jsonify({"error": "Invalid department name"}), 400
        fields.append("dept_id = %s")
        values.append(dept_results[0]['department_id'])
    
    if 'salary' in data:
        fields.append("salary = %s")
        values.append(data['salary'])

    if not fields:
        return jsonify({"error": "No valid fields to update"}), 400

    values.append(employee_id)
    update_query = f"UPDATE Employee SET {', '.join(fields)} WHERE employee_id = %s"
    
    if execute_query(update_query, tuple(values), is_select=False):
        return jsonify({"message": "Operative details updated"}), 200
    return jsonify({"error": "Failed to update record"}), 404

@employee_bp.route('/employees/<int:employee_id>', methods=['DELETE'])
def delete_employee(employee_id):
    """Remove employee record."""
    delete_query = "DELETE FROM Employee WHERE employee_id = %s"
    if execute_query(delete_query, (employee_id,), is_select=False):
        return jsonify({"message": "Operative record purged"}), 200
    return jsonify({"error": "Operative not found"}), 404
