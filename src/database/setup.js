import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function executeSQLFile(connection, filePath) {
    const sql = fs.readFileSync(filePath, 'utf8');

    const statements = sql
        .split('$$')
        .map(s => s.trim())
        .filter(Boolean);

    for (const stmt of statements) {
        await connection.query(stmt);
        console.log(`Ejecutado: ${stmt.split('\n')[0].slice(0, 50)}...`);
    }
}

async function setupDatabase() {
    let connection;
    try {
        // Conexión sin base de datos
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            multipleStatements: true
        });

        console.log('Conectado a MySQL para setup');

        // Crear base de datos si no existe
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
        await connection.query(`USE \`${process.env.DB_NAME}\``);

        // Ejecutar reservas.sql
        const schemaPath = path.join(__dirname, 'reservas.sql');
        if (!fs.existsSync(schemaPath)) throw new Error('reservas.sql no encontrado');
        console.log('\n Creando tablas...');
        await executeSQLFile(connection, schemaPath);

        // Ejecutar stored_procedures.sql
        const proceduresPath = path.join(__dirname, 'stored_procedures.sql');
        if (!fs.existsSync(proceduresPath)) throw new Error('stored_procedures.sql no encontrado');
        console.log('\n Creando procedures...');
        await executeSQLFile(connection, proceduresPath);

        console.log('\nBase de datos configurada correctamente!');

    } catch (err) {
        console.error('Error en setup:', err.message);
    } finally {
        if (connection) await connection.end();
    }
}

// Ejecutar si es llamado directamente
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    setupDatabase();
}

export { setupDatabase };
