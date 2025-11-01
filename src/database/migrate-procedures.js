import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function migrateProceduresOnly() {
  let connection;
  try {
    connection = await pool.getConnection();
    console.log('Conectado a la base de datos para procedures');

    const proceduresPath = path.join(__dirname, 'stored_procedures.sql');
    if (!fs.existsSync(proceduresPath)) throw new Error('stored_procedures.sql no encontrado');

    const sql = fs.readFileSync(proceduresPath, 'utf8');

    // Dividimos cada procedimiento por su comentario
    const statements = sql
      .split(/-- Procedimiento:/)
      .map(s => s.trim())
      .filter(s => s.startsWith('CREATE PROCEDURE'));

    for (const stmt of statements) {
      const procNameMatch = stmt.match(/CREATE PROCEDURE\s+(\w+)/i);
      if (!procNameMatch) continue;
      const procName = procNameMatch[1];

      await connection.query(`DROP PROCEDURE IF EXISTS ${procName}`);
      await connection.query(stmt);
      console.log(`Procedure migrado: ${procName}`);
    }

    console.log('\n Todos los procedures migrados correctamente!');
  } catch (err) {
    console.error(' Error en procedures:', err.message);
  } finally {
    if (connection) connection.release();
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  migrateProceduresOnly();
}

export { migrateProceduresOnly };
