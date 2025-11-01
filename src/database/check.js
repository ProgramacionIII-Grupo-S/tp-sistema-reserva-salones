import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import pool from '../config/db.js';

dotenv.config();

async function checkDatabaseStatus() {
    let connection;
    try {
        connection = await pool.getConnection();
        console.log('Conexión exitosa a la base de datos');

        const [tables] = await connection.query(`
            SELECT TABLE_NAME FROM information_schema.TABLES
            WHERE TABLE_SCHEMA = ?
        `, [process.env.DB_NAME]);
        console.log(`\n Tablas (${tables.length}):`, tables.map(t => t.TABLE_NAME));

        const [procedures] = await connection.query(`
            SELECT ROUTINE_NAME FROM information_schema.ROUTINES
            WHERE ROUTINE_TYPE = 'PROCEDURE' AND ROUTINE_SCHEMA = ?
        `, [process.env.DB_NAME]);
        console.log(`\n  Procedures (${procedures.length}):`, procedures.map(p => p.ROUTINE_NAME));

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        if (connection) connection.release();
    }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    checkDatabaseStatus();
}

export { checkDatabaseStatus };
