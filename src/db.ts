import 'dotenv/config';
import { Client } from 'pg';

export const db = new Client({
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT) || 5432
});

export async function connectDB() {
    try {
        await db.connect();
        console.log('Connected to PostgreSQL database.');
    } catch (error) {
        console.error('Database connection failed:', error);
        process.exit(1);
    }
}