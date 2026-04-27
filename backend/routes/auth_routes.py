from flask import Blueprint, request, jsonify
from data import USERS

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/auth/login', methods=['POST'])
def login():
    """Handle tactical login and return user role"""
    data = request.get_json()
    if not data or 'email' not in data:
        return jsonify({"error": "email required"}), 400
    
    email = data.get('email')
    
    # Simple tactical verification: Allow any email for now, or check for specific admin
    if "@" in email:
        return jsonify({
            "success": True, 
            "message": "Auth link sent to " + email, 
            "role": "admin" if "admin" in email.lower() else "operative"
        }), 200
    
    return jsonify({"success": False, "error": "Invalid tactical signature"}), 401
