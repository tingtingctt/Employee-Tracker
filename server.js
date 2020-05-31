var mysql = require("mysql");
var inquirer = require("inquirer");
var cTable = require('console.table');
var util = require('util');

// global variables that re-store all employees and roles each time the app is refreshed by init()
var allEmployees = [];
var allRoles = [];

// connect mySQL
var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "35Ucla35!",
  database: "employees_db"
});

connection.connect(function(err) {
  if (err) throw err;
  // once connected to mySQL, start prompting
  init();
});


// initiate by prompting the user to select a task
async function init() {
  // update global variable of allEmployees array each time the app is refreshed
  var dataEmployees = await connection.query("SELECT * FROM employee",function(err, res) {
      if (err) throw err;
      res.forEach (function(employee){
        allEmployees.push(employee.first_name + " " + employee.last_name);
      });
    });

  // update global variable of allRoles array each time the app is refreshed
  var dataRoles = await connection.query("SELECT * FROM role LEFT JOIN department ON role.department_id = department.id", function(err, res) {
      if (err) throw err;
      res.forEach (function(role){
        allRoles.push(role.dept + " " + role.title);
      });
    });
  
  // start prompting
  inquirer
    .prompt({
      name: "action",
      type: "rawlist",
      message: "What would you like to do?",
      choices: [
        "Add a department",
        "Add a role",
        "Add an employee",
        "View departments",
        "View roles",
        "View employees",
        "Update an employee's role",
        "Finish"
      ]
    })
    .then(function(answer) {
      switch (answer.action) {
      case "Add a department":
        addDepartment();
        break;

      case "Add a role":
        addRole();
        break;

      case "Add an employee":
        addEmployee();
        break;

      case "View departments":
        viewDepartments();
        break;

      case "View roles":
        viewRoles();
        break;

      case "View employees":
        viewEmployees();
        break;

      case "Update an employee's role":
        updateRole();
        break;

      case "Finish":
        connection.end();
        break;
      }
    });
}

// add a department
function addDepartment() {
  inquirer
    .prompt({
      name: "department",
      type: "input",
      message: "What department would you like to add?"
    })
    .then(function(answer) {
      var query = "INSERT INTO department (dept) VALUES (?)";
      connection.query(query, [answer.department], function(err) {
        if (err) throw err;
        // view updated department list
        viewDepartments();
      });
    });
}

// add a role
async function addRole() {
  // save all department names in an array to be accessed in the choice prompt below
  var depts = [];
  var query = "SELECT * FROM department";
  var data = await connection.query(query,function(err, res) {
      if (err) throw err;
      res.forEach (function(dept){
        depts.push(dept.dept);
      });
    });

  inquirer
    .prompt([{
      name: "role",
      type: "input",
      message: "What role would you like to add?"
    },
    {
      name: "salary",
      type: "input",
      message: "What's the salary of this role?"
    },
    {
      name: "department",
      type: "rawlist",
      message: "Which department does this role belong to?",
      // list the array items above
      choices: depts
    },
  ])
    .then(function(answer) {
      // the department_id in the mySQL database equals (the answer's index # in the array + 1)
      var dept_id = depts.indexOf(answer.department) + 1;
      var query = "INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)";
      connection.query(query, [answer.role, answer.salary, dept_id], function(err) {
        if (err) throw err;
        // view updated role list
        viewRoles();
      });
    });
}

// add an employee
async function addEmployee() {
  // add "null" to the employees array, as a choice to "manager" prompt if the new employee does not have a manager
  var employees = ["null"];
  var dataEmployees = await connection.query("SELECT * FROM employee",function(err, res) {
      if (err) throw err;
      res.forEach (function(employee){
        employees.push(employee.first_name + " " + employee.last_name);
      });
    });

  inquirer
    .prompt([{
      name: "first_name",
      type: "input",
      message: "What's the first name of the employee?"
    },
    {
      name: "last_name",
      type: "input",
      message: "What's the last name of the employee?"
    },
    {
      name: "role",
      type: "rawlist",
      message: "What is the role of this employee?",
      // access the global "allRoles" array
      choices: allRoles
    },
    {
      name: "manager",
      type: "rawlist",
      message: "Who is the manager of this employee?",
      // access the local employees array with an option of "null"
      choices: employees
    }
  ])
    .then(function(answer) {
      // the role_id in the mySQL database equals (the answer's index # in the global "allRoles" array + 1)
      var role_id = allRoles.indexOf(answer.role) + 1;
      // the manager_id in the mySQL database equals the answer's index # in the local "employees" array ("null" equals index 0)
      var manager_id = employees.indexOf(answer.manager);
      var query = "INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)";
      connection.query(query, [answer.first_name, answer.last_name, role_id, manager_id], function(err) {
        if (err) throw err;
        // view updated employee list
        viewEmployees();
      });
    });
}

// view all departments
async function viewDepartments() {
  var query = "SELECT * FROM department";
  var data = await connection.query(query,function(err, res) {
      if (err) throw err;
      console.log("\n");
      console.table(res)
    });
    // returns to main prompts
    init();
}

// view all roles
async function viewRoles() {
  // display all roles in different departments, using department_id as a bridge
  var query = "SELECT role.title, department.dept FROM department RIGHT JOIN role ON role.department_id = department.id";
  var data = await connection.query(query,function(err, res) {
      if (err) throw err;
      console.log("\n");
      console.table(res)
    });
    // returns to main prompts
    init();
}

// view all employees
async function viewEmployees() {
  // joining all 3 tables in the database
  // display all employees with relevant info
  var query = "SELECT employee.id, employee.first_name, employee.last_name, department.dept, role.title, employee.manager_id FROM employee LEFT JOIN role ON employee.role_id = role.id INNER JOIN department ON role.department_id = department.id";
  var data = await connection.query(query,function(err, res) {
      if (err) throw err;
      console.log("\n");
      console.table(res)
    });
    // returns to main prompts
    init();
}

// update an employee's role
async function updateRole() {
  inquirer
      .prompt([
        {
          name: "employee",
          type: "rawlist",
          message: "Who is the employee to be updated?",
          // access the global "allEmployees" array
          choices: allEmployees
        },
        {
          name: "role",
          type: "rawlist",
          message: "What is the new role of this employee?",
          // access the global "allRoles" array
          choices: allRoles
        }
      ])
      .then(function(answer) {
        // the role_id in the mySQL database equals (the answer's index # in the global "allRoles" array + 1)
        var role_id = allRoles.indexOf(answer.role) + 1;
        // the employee_id in the mySQL database equals (the answer's index # in the global "allEmployees" array + 1)
        var employee_id = allEmployees.indexOf(answer.employee) + 1;
        var query = "UPDATE employee SET role_id = ? WHERE id = ?";
        connection.query(query, [role_id, employee_id], function(err) {
          if (err) throw err;
          // returns to main prompts
          viewEmployees();
        });
      });
  }

