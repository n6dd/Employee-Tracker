import inquirer from 'inquirer';
import Table from 'cli-table3';
import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

import { connectDB } from './db';

    async function init() {
        await connectDB();
        await mainMenu();
    }
    
    init();

const db = new Client({
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

async function mainMenu() {
    const { choice } = await inquirer.prompt({
        type: 'list',
        name: 'choice',
        message: 'What would you like to do?',
        choices: [
            'View all departments',
            'View all roles',
            'View all employees',
            'Add a department',
            'Add a role',
            'Add an employee',
            'Update an employee role',
            'Exit'
        ]
    });

    switch (choice) {
        case 'View all departments':
            await viewDepartments();
            break;
        case 'View all roles':
            await viewRoles();
            break;
        case 'View all employees':
            await viewEmployees();
            break;
        case 'Add a department':
            await addDepartment();
            break;
        case 'Add a role':
            await addRole();
            break;
        case 'Add an employee':
            await addEmployee();
            break;
        case 'Update an employee role':
            await updateEmployeeRole();
            break;
        case 'Exit':
            await db.end();
            process.exit();
    }
}

function displayTable(headers: string[], rows: { [key: string]: any }[]) {
    const table = new Table({ head: headers });
    rows.forEach(row => table.push(Object.values(row).flat() as Table.HorizontalTableRow));
    console.log(table.toString());
}

async function viewDepartments() {
    const result = await db.query('SELECT * FROM department');
    console.log(result.rows);
    displayTable(['ID', 'Name'], result.rows);
}

async function viewRoles() {
    const result = await db.query(`
        SELECT role.id, role.title, department.name AS department, role.salary 
        FROM role 
        JOIN department ON role.department_id = department.id
    `);
    displayTable(['ID', 'Title', 'Department', 'Salary'], result.rows);
}

async function viewEmployees() {
    const result = await db.query(`
        SELECT employee.id, employee.first_name, employee.last_name, role.title, 
               department.name AS department, role.salary, 
               CONCAT(manager.first_name, ' ', manager.last_name) AS manager 
        FROM employee 
        LEFT JOIN role ON employee.role_id = role.id 
        LEFT JOIN department ON role.department_id = department.id 
        LEFT JOIN employee manager ON employee.manager_id = manager.id
    `);
    displayTable(['ID', 'First Name', 'Last Name', 'Title', 'Department', 'Salary', 'Manager'], result.rows);
}

async function addDepartment() {
    const { name } = await inquirer.prompt({
        type: 'input',
        name: 'name',
        message: 'Enter the department name:'
    });
    await db.query('INSERT INTO department (name) VALUES ($1)', [name]);
    console.log('Department added!');
}

async function addRole() {
    const { title, salary, department_id } = await inquirer.prompt([
        { type: 'input', name: 'title', message: 'Enter role title:' },
        { type: 'input', name: 'salary', message: 'Enter role salary:' },
        { type: 'input', name: 'department_id', message: 'Enter department ID:' }
    ]);
    await db.query('INSERT INTO role (title, salary, department_id) VALUES ($1, $2, $3)', [title, salary, department_id]);
    console.log('Role added!');
}

async function addEmployee() {
    const { first_name, last_name, role_id, manager_id } = await inquirer.prompt([
        { type: 'input', name: 'first_name', message: 'Enter first name:' },
        { type: 'input', name: 'last_name', message: 'Enter last name:' },
        { type: 'input', name: 'role_id', message: 'Enter role ID:' },
        { type: 'input', name: 'manager_id', message: 'Enter manager ID (or leave blank for none):' }
    ]);
    await db.query('INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)', [first_name, last_name, role_id, manager_id || null]);
    console.log('Employee added!');
}

async function updateEmployeeRole() {
    const employees = await db.query('SELECT id, first_name, last_name FROM employee');
    const roles = await db.query('SELECT id, title FROM role');

    const employeeChoices = employees.rows.map(emp => ({
        name: `${emp.first_name} ${emp.last_name}`,
        value: emp.id
    }));

    const roleChoices = roles.rows.map(role => ({
        name: role.title,
        value: role.id
    }));

    const { employee_id } = await inquirer.prompt({
        type: 'list',
        name: 'employee_id',
        message: 'Select an employee to update:',
        choices: employeeChoices
    });

    const { role_id } = await inquirer.prompt({
        type: 'list',
        name: 'role_id',
        message: 'Select the new role:',
        choices: roleChoices
    });

    await db.query('UPDATE employee SET role_id = $1 WHERE id = $2', [role_id, employee_id]);
    console.log('Employee role updated successfully!');
}
