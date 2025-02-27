"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
exports.connectDB = connectDB;
require("dotenv/config");
const pg_1 = require("pg");
exports.db = new pg_1.Client({
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT) || 5432
});
async function connectDB() {
    try {
        await exports.db.connect();
        console.log('Connected to PostgreSQL database.');
    }
    catch (error) {
        console.error('Database connection failed:', error);
        process.exit(1);
    }
}
