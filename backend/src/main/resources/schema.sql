-- Drop tables if they exist to start fresh
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS performance_reviews CASCADE;
DROP TABLE IF EXISTS attendance CASCADE;
DROP TABLE IF EXISTS wfh_requests CASCADE;
DROP TABLE IF EXISTS leave_requests CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS employees CASCADE;
DROP TABLE IF EXISTS departments CASCADE;

-- 1. Departments Table
CREATE TABLE departments (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    manager_id UUID,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

-- 2. Employees Table
CREATE TABLE employees (
    id UUID PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(500) NOT NULL,
    phone VARCHAR(50),
    job_title VARCHAR(255),
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    salary NUMERIC(19, 2),
    date_of_joining DATE,
    status VARCHAR(50) NOT NULL,
    role VARCHAR(50) NOT NULL,
    manager_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

-- Add circular dependency constraint for Department Manager
ALTER TABLE departments 
    ADD CONSTRAINT fk_departments_manager 
    FOREIGN KEY (manager_id) REFERENCES employees(id) ON DELETE SET NULL;

-- 3. Leave Requests Table
CREATE TABLE leave_requests (
    id UUID PRIMARY KEY,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    leave_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    reason VARCHAR(1000),
    approved_by_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    approved_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

-- 4. WFH Requests Table
CREATE TABLE wfh_requests (
    id UUID PRIMARY KEY,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL,
    reason VARCHAR(1000),
    approved_by_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    approved_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

-- 5. Attendance (Punch-in / Punch-out) Table
CREATE TABLE attendance (
    id UUID PRIMARY KEY,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    clock_in TIMESTAMP NOT NULL,
    clock_out TIMESTAMP,
    work_location VARCHAR(50) NOT NULL,
    work_hours NUMERIC(5, 2),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

-- 6. Performance Reviews Table
CREATE TABLE performance_reviews (
    id UUID PRIMARY KEY,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    review_date DATE NOT NULL,
    feedback TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

-- 7. Tasks Table
CREATE TABLE tasks (
    id UUID PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    assigned_to_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    assigned_by_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    due_date DATE,
    status VARCHAR(50) NOT NULL,
    priority VARCHAR(50) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

-- 8. Notifications Table
CREATE TABLE notifications (
    id UUID PRIMARY KEY,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    type VARCHAR(100) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);
