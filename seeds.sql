USE employees_db;
INSERT INTO department (dept)
VALUES ("Sales"),("IT"),("Marketing"),("HR");

INSERT INTO role (title, salary, department_id)
VALUES ("Manager", 200000, 1), ("Assistant", 80000, 1), ("Intern", 40000, 1),
("Chief_Engineer", 250000, 2), ("Senior_Engineer", 200000, 2), ("Junior_Engineer", 150000, 2), ("Intern", 70000, 2),
("Manager", 180000, 3), ("Assistant", 80000, 3), ("Intern", 40000, 3),
("Manager", 100000, 4), ("Assistant", 50000, 4), ("Intern", 30000, 4);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("Bryan", "Swarthout", 4, null), ("Wilson", "Lam", 6, null), 
("Leo", "DiCaprio", 1, null), ("Tina", "Fay", 8, null), ("Ellen", "Degenerous", 11, null);

SELECT * FROM department;
SELECT * FROM role;
SELECT * FROM employee;