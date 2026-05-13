import bcrypt from 'bcryptjs';
import { query, insertReturningId, lowercaseRows } from '../config/db.js';

export const usuariosService = {
  async listUsers() {
    const result = await query(
      `SELECT u.id, u.nombre, u.email,
              r.nombre AS "rol", e.nombre AS "estado",
              u.created_at
         FROM usuarios u
         LEFT JOIN roles   r ON r.id = u.rol_id
         LEFT JOIN estados e ON e.id = u.estado_id
        ORDER BY u.id DESC`
    );
    return lowercaseRows(result.rows);
  },

  async createUser({ nombre, email, password, rol = 'admin' }) {
    const existing = await query(
      `SELECT id FROM usuarios WHERE email = :email FETCH FIRST 1 ROWS ONLY`,
      { email }
    );
    if (existing.rows[0]) {
      const err = new Error('Ya existe un usuario con ese correo');
      err.status = 400;
      throw err;
    }

    let passwordHash = password;
    const isBcryptHash =
      typeof password === 'string' && /^\$2[aby]\$[0-9]{2}\$/.test(password);
    if (!isBcryptHash) {
      passwordHash = await bcrypt.hash(password, 10);
    }

    const id = await insertReturningId(
      `INSERT INTO usuarios (nombre, email, password_hash, rol_id, estado_id, created_at)
       VALUES (:nombre, :email, :passwordHash,
               (SELECT id FROM roles   WHERE nombre = :rol),
               (SELECT id FROM estados WHERE nombre = 'Activo' AND contexto = 'usuario'),
               SYSTIMESTAMP)
       RETURNING id INTO :outId`,
      { nombre, email, passwordHash, rol }
    );

    return { id, nombre, email, rol, estado: 'Activo', created_at: new Date() };
  },
};
