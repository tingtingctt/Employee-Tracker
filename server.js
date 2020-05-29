var mysql = require("mysql");
var inquirer = require("inquirer");
var cTable = require('console.table');
var util = require('util');

var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "35Ucla35!",
  database: "employees_db"
});

connection.connect(function(err) {
  if (err) throw err;
  init();
});

function init() {
  // var query = "SELECT e.first_name e.last_name r.title r.name r.salary FROM employee e INNER JOIN role r ON e.role_id = r.id INNER JOIN deparment d ON (r.department_id = d.id)";
  // connection.query(query,function(err, res) {
  //   if (err) throw err;
  //   console.table(res)
  // });
  
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

function addDepartment() {
  inquirer
    .prompt({
      name: "department",
      type: "input",
      message: "What department would you like to add?"
    })
    .then(function(answer) {
      var query = "INSERT INTO department (name) VALUES (?)";
      connection.query(query, [answer.department], function(err) {
        if (err) throw err;
        viewDepartments();
      });
    });
}

function addRole() {
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
      name: "department_id",
      type: "input",
      message: "What's the department id of this role?"
    },
  ])
    .then(function(answer) {
      var query = "INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)";
      connection.query(query, [answer.role, answer.salary, answer.department_id], function(err) {
        if (err) throw err;
        viewRoles();
      });
    });
}

async function viewDepartments() {
  var query = "SELECT * FROM department";
  var data = await connection.query(query,function(err, res) {
      if (err) throw err;
      console.table(res)
    });
    init();
}

async function viewRoles() {
  var query = "SELECT * FROM role";
  var data = await connection.query(query,function(err, res) {
      if (err) throw err;
      console.table(res)
    });
    init();
}

// async function viewDepartments() {
//   var query = "SELECT * FROM department";
//   var data = await connection.query(query,function(err, res) {
//       if (err) throw err;
//       return res
//     });
//     console.table(data);
//     init();
// }