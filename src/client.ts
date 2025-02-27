import inquirer from 'inquirer';
import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const db = new Client({
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
});

async function init() {
    await db.connect();  
    await mainMenu();    
}

init();

async function mainMenu() {
    let exit = false;
    
    while (!exit) {
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
                exit = true;  
                break;
        }}
}

function displayTable(rows: { [key: string]: any }[]) {
    console.table(rows); 
}

async function viewDepartments() {
    const result = await db.query('SELECT * FROM department');
    if (result.rows.length > 0) {
        displayTable(result.rows);
    } else {
        console.log('No departments found.');
    }
}

async function viewRoles() {
    const result = await db.query(`
        SELECT role.id, role.title, department.name AS department, role.salary 
        FROM role 
        JOIN department ON role.department_id = department.id
    `);
    displayTable(result.rows);
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

    if (result.rows.length > 0) {
        displayTable(result.rows);
    } else {
        console.log('No employees found.');
    }
}

async function addDepartment() {
    const { name } = await inquirer.prompt({
        type: 'input',
        name: 'name',
        message: 'Enter the department name:'
    });
    await db.query('INSERT INTO department (name) VALUES ($1)', [name]);
    console.log('Department added!');
    
    await viewDepartments();
}

async function addRole() {
    const { title, salary, department_id } = await inquirer.prompt([
        { type: 'input', name: 'title', message: 'Enter role title:' },
        { type: 'input', name: 'salary', message: 'Enter role salary:' },
        { type: 'input', name: 'department_id', message: 'Enter department ID:' }
    ]);
    await db.query('INSERT INTO role (title, salary, department_id) VALUES ($1, $2, $3)', [title, salary, department_id]);
    console.log('Role added!');
    
    await viewRoles();
}

async function addEmployee() {
    const rolesResult = await db.query('SELECT id, title FROM role');
    const roles = rolesResult.rows;

    if (roles.length === 0) {
        console.log('No roles found. Please add roles before adding employees.');
        return;
    }

    const roleChoices = roles.map(role => ({
        name: role.title,
        value: role.id
    }));

    const { first_name, last_name, role_id, manager_id } = await inquirer.prompt([ 
        { type: 'input', name: 'first_name', message: 'Enter first name:' },
        { type: 'input', name: 'last_name', message: 'Enter last name:' },
        { 
            type: 'list', 
            name: 'role_id', 
            message: 'Select the role for the employee:',
            choices: roleChoices
        },
        { type: 'input', name: 'manager_id', message: 'Enter manager ID (or leave blank for none):' }
    ]);

    const validRole = roles.find(role => role.id === parseInt(role_id));

    if (!validRole) {
        console.log('Invalid role ID. Please select a valid role.');
        return;
    }

    await db.query('INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)', [first_name, last_name, role_id, manager_id || null]);
    console.log('Employee added!');
    
    await viewEmployees();
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

    await viewEmployees();
}