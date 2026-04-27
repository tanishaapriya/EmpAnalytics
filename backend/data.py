# data.py - Single source of truth for Phase 1 (In-memory storage)

# get_next_id: Helper function to auto-generate incremental IDs for any list of dicts
def get_next_id(data_list, id_key='employee_id'):
    if not data_list:
        return 1
    return max(item[id_key] for item in data_list) + 1

# EMPLOYEES: Mock employee data
EMPLOYEES = [
    { "employee_id": 1, "employee_name": "Alice Johnson", "dept": "Engineering", "salary": 85000 },
    { "employee_id": 2, "employee_name": "Bob Smith",     "dept": "Marketing",   "salary": 62000 },
    { "employee_id": 3, "employee_name": "Carol White",   "dept": "HR",          "salary": 54000 },
    { "employee_id": 4, "employee_name": "David Lee",     "dept": "Engineering", "salary": 91000 },
    { "employee_id": 5, "employee_name": "Eva Martinez",  "dept": "Sales",       "salary": 70000 }
]

# TASKS: Tactical workforce assignments
TASKS = [
    { "task_id": 101, "employee_id": 1, "task_name": "Build login API",        "status": "completed" },
    { "task_id": 102, "employee_id": 2, "task_name": "Design landing page",    "status": "in_progress" },
    { "task_id": 103, "employee_id": 3, "task_name": "Conduct interviews",     "status": "pending" },
    { "task_id": 104, "employee_id": 4, "task_name": "Optimize database",      "status": "completed" },
    { "task_id": 105, "employee_id": 5, "task_name": "Q3 sales report",        "status": "in_progress" }
]

# PERFORMANCE: Employee metrics (scale 1-5 for Phase 1 logic)
PERFORMANCE = [
    { "employee_id": 1, "score": 5 },
    { "employee_id": 2, "score": 4 },
    { "employee_id": 3, "score": 2 }, # High-risk target
    { "employee_id": 4, "score": 5 },
    { "employee_id": 5, "score": 1 }  # High-risk target
]

# ATTRITION: AI-predicted risk levels
ATTRITION = [
    { "employee_id": 1, "risk_level": "low" },
    { "employee_id": 2, "risk_level": "medium" },
    { "employee_id": 3, "risk_level": "high" },
    { "employee_id": 4, "risk_level": "low" },
    { "employee_id": 5, "risk_level": "high" }
]

# USERS: Auth credentials for mock login
USERS = [
    { "username": "admin", "password": "admin123", "role": "admin" },
    { "username": "manager", "password": "manager123", "role": "manager" }
]

# --- Phase 2 Placeholder ---
# When migrating, replace the above lists with MySQL connector logic.
# The blueprints will continue to call these constants/functions without change.
