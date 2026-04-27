# EmpAnalytics Backend Documentation

## A) Run Instructions
To start the tactical HR intelligence backend:

1. **Install Dependencies**:
   ```bash
   pip install -r backend/requirements.txt
   ```
2. **Launch Server**:
   ```bash
   python backend/app.py
   ```
3. **Access API**: The server will be listening at `http://localhost:5000`

---

## B) Example JSON Responses

### 1. Login
**POST** `/api/auth/login`
```json
{
    "success": true,
    "message": "Login successful",
    "role": "admin"
}
```

### 2. Get Employees
**GET** `/api/employees`
```json
[
    { "employee_id": 1, "employee_name": "Alice Johnson", "dept": "Engineering", "salary": 85000 },
    ...
]
```

### 3. Create Employee
**POST** `/api/employees`
```json
{
    "employee_id": 6,
    "employee_name": "John Doe",
    "dept": "Design",
    "salary": 65000
}
```

---

## C) Example Frontend Fetch Code

### 1. Login (POST /login)
```javascript
async function login(username, password) {
  try {
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const result = await response.json();
    if (result.success) {
      console.log("Logged in as:", result.role);
    } else {
      console.error("Login failed:", result.error);
    }
  } catch (error) {
    console.error("Network Error:", error);
  }
}
```

### 2. Get All Employees (GET /employees)
```javascript
async function fetchEmployees() {
  try {
    const response = await fetch('http://localhost:5000/api/employees');
    const employees = await response.json();
    console.table(employees);
  } catch (error) {
    console.error("Fetch Error:", error);
  }
}
```

---

## D) Phase 2 Migration Checklist
To switch from in-memory dummy data to a MySQL database, **ONLY** modify `backend/data.py`:

1. [ ] **Install Connector**: Uncomment `mysql-connector-python` in `requirements.txt` and install.
2. [ ] **Update connection**: Import `mysql.connector` in `data.py`.
3. [ ] **Refactor Constants**: Replace the list constants (e.g., `EMPLOYEES`) with classes or functions that query the database.
4. [ ] **Sync Routes**: Ensure your query functions return the same dictionary structure currently defined in the mock data.
5. [ ] **Verify**: Since the blueprints use the `EMPLOYEES` and `TASKS` variables/functions, the frontend and route logic will remain **completely unchanged**.
