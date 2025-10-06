import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Crear pool de conexiones
const pool = mysql.createPool(dbConfig);

// Probar la conexión
(async () => {
    try {
        const connection = await pool.getConnection();
        console.log('Conectado a mysql');
        connection.release();
    } catch (err) {
        console.error('Error conectando a MySQL:', err);
    }
})();

export default pool;
