"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEmployees = exports.getRoles = exports.getDepartments = void 0;
const db_1 = require("./db");
const getDepartments = async () => {
    const result = await db_1.db.query('SELECT * FROM department');
    return result.rows;
};
exports.getDepartments = getDepartments;
const getRoles = async () => {
    const result = await db_1.db.query(`
        SELECT role.id, role.title, department.name AS department, role.salary 
        FROM role 
        JOIN department ON role.department_id = department.id
    `);
    return result.rows;
};
exports.getRoles = getRoles;
const getEmployees = async () => {
    const result = await db_1.db.query(`
        SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, 
               role.salary, CONCAT(manager.first_name, ' ', manager.last_name) AS manager 
        FROM employee 
        LEFT JOIN role ON employee.role_id = role.id 
        LEFT JOIN department ON role.department_id = department.id 
        LEFT JOIN employee manager ON employee.manager_id = manager.id
    `);
    return result.rows;
};
exports.getEmployees = getEmployees;
