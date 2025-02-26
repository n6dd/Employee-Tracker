INSERT INTO department (name) VALUES
('Human Resources'),
('Engineering'),
('Sales'),
('Marketing'),
('Finance');

INSERT INTO role (title, salary, department_id) VALUES
('HR Manager', 75000, 1),
('Software Engineer', 90000, 2),
('Sales Associate', 60000, 3),
('Marketing Specialist', 65000, 4),
('Financial Analyst', 70000, 5),
('Senior Software Engineer', 110000, 2),
('Sales Manager', 85000, 3);

INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES
('Alice', 'Johnson', 1, NULL),  
('Bob', 'Smith', 2, NULL),  
('Charlie', 'Davis', 3, NULL),  
('David', 'Brown', 4, NULL),  
('Eve', 'White', 5, NULL),  
('Frank', 'Miller', 6, 2),  
('Grace', 'Taylor', 7, 3), 
('Hank', 'Anderson', 2, 6),  
('Ivy', 'Clark', 3, 7),  
('Jack', 'Hall', 3, 7);  

