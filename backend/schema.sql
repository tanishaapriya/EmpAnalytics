/* 
   EmpAnalytics Database Schema Setup
   Run this script in your MySQL Workbench or CLI to prepare the database for Phase 2.
*/

CREATE DATABASE IF NOT EXISTS EmpAnalytics;
USE EmpAnalytics;

-- Table: Department
CREATE TABLE IF NOT EXISTS Department (
    department_id INT PRIMARY KEY AUTO_INCREMENT,
    department_name VARCHAR(100) NOT NULL UNIQUE
);

-- Table: Employee
CREATE TABLE IF NOT EXISTS Employee (
    employee_id INT PRIMARY KEY AUTO_INCREMENT,
    employee_name VARCHAR(255) NOT NULL,
    dept_id INT,
    salary INT,
    FOREIGN KEY (dept_id) REFERENCES Department(department_id)
);

-- Table: Task
CREATE TABLE IF NOT EXISTS Task (
    task_id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id INT,
    task_name VARCHAR(255) NOT NULL,
    status VARCHAR(50), -- e.g., 'pending', 'in_progress', 'completed'
    FOREIGN KEY (employee_id) REFERENCES Employee(employee_id) ON DELETE CASCADE
);

-- Table: Performance
CREATE TABLE IF NOT EXISTS Performance (
    employee_id INT,
    score INT CHECK (score BETWEEN 1 AND 5),
    FOREIGN KEY (employee_id) REFERENCES Employee(employee_id) ON DELETE CASCADE
);

-- Table: Attrition_Prediction
CREATE TABLE IF NOT EXISTS Attrition_Prediction (
    employee_id INT,
    risk_level VARCHAR(50), -- e.g., 'Low', 'Medium', 'High'
    FOREIGN KEY (employee_id) REFERENCES Employee(employee_id) ON DELETE CASCADE
);

-- Initial Mock Data (Optional)
INSERT INTO Department (department_name) VALUES ('Engineering'), ('Sales'), ('HR'), ('Marketing'), ('Product');

INSERT INTO Employee (employee_name, dept_id, salary) VALUES 
('Alice Johnson', 1, 85000),
('Bob Smith', 2, 62000),
('Carol Weaver', 3, 58000),
('David Lee', 1, 92000),
('Eva Martinez', 4, 67000);

INSERT INTO Performance (employee_id, score) VALUES (1, 5), (2, 4), (3, 2), (4, 5), (5, 1);

INSERT INTO Attrition_Prediction (employee_id, risk_level) VALUES (1, 'Low'), (2, 'Low'), (3, 'High'), (4, 'Low'), (5, 'High');

INSERT INTO Task (employee_id, task_name, status) VALUES 
(1, 'Build login API', 'completed'),
(2, 'Design landing page', 'in_progress'),
(3, 'Conduct interviews', 'pending');
