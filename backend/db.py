import mysql.connector
from mysql.connector import Error

def get_connection():
    """Establish and return a connection to the existing MySQL database."""
    try:
        connection = mysql.connector.connect(
            host="localhost",
            user="root",
            password="Ishita@@2",
            database="EmpAnalytics"
        )
        if connection.is_connected():
            return connection
    except Error as e:
        print(f"Database Connection Error: {e}")
        return None

def execute_query(query, params=None, is_select=True):
    """Utility function to execute queries and manage connection lifecycle."""
    conn = get_connection()
    if conn is None:
        return None
    
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute(query, params or ())
        
        if is_select:
            results = cursor.fetchall()
            return results
        else:
            conn.commit()
            return cursor.rowcount
            
    except Error as e:
        print(f"Query Execution Error: {e}")
        return None
    finally:
        if conn and conn.is_connected():
            cursor.close()
            conn.close()
