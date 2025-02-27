import 'dotenv/config';
import { Client } from 'pg';

export const db = new Client({
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
});

export async function connectDB() {
    try {
        await db.connect();
        console.log('Connected to PostgreSQL database');
    } catch (error) {
        console.error('Failed to connect to the database:', error);
        process.exit(1); 
    }
}