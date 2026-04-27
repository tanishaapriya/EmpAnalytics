from flask import Flask, jsonify
from flask_cors import CORS
from db import get_connection

# Import Blueprints
from routes.auth_routes import auth_bp
from routes.employee_routes import employee_bp
from routes.task_routes import task_bp
from routes.performance_routes import performance_bp
from routes.attrition_routes import attrition_bp

def create_app():
    app = Flask(__name__)
    
    # Enable CORS for all roots
    CORS(app)
    
    # Register Blueprints with /api prefix
    app.register_blueprint(auth_bp, url_prefix='/api')
    app.register_blueprint(employee_bp, url_prefix='/api')
    app.register_blueprint(task_bp, url_prefix='/api')
    app.register_blueprint(performance_bp, url_prefix='/api')
    app.register_blueprint(attrition_bp, url_prefix='/api')
    
    # Base Verification Route (Requested Specific Message)
    @app.route('/', methods=['GET'])
    def health_check():
        conn = get_connection()
        if conn and conn.is_connected():
            conn.close()
            return jsonify({
                "message": "Connected to existing EmpAnalytics database"
            }), 200
        return jsonify({"message": "Database Connection Error"}), 500

    return app

if __name__ == "__main__":
    app = create_app()
    app.run(debug=True, port=5000)
