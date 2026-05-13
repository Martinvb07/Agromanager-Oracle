import bcrypt from 'bcryptjs';
import { query, lowercaseRow } from '../config/db.js';

export const authService = {
  async loginWithEmailPassword(email, password) {
    const result = await query(
      `SELECT u.id, u.nombre, u.email, u.password_hash,
              r.nombre AS "rol", e.nombre AS "estado"
         FROM usuarios u
         LEFT JOIN roles   r ON r.id = u.rol_id
         LEFT JOIN estados e ON e.id = u.estado_id
        WHERE u.email = :email
        FETCH FIRST 1 ROWS ONLY`,
      { email }
    );

    const user = lowercaseRow(result.rows[0]);

    if (!user) {
      const err = new Error('Credenciales inválidas');
      err.status = 401;
      throw err;
    }

    if (user.estado !== 'Activo') {
      const err = new Error('Usuario inactivo');
      err.status = 403;
      throw err;
    }

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      const err = new Error('Credenciales inválidas');
      err.status = 401;
      throw err;
    }

    const { password_hash, ...safeUser } = user;
    return safeUser;
  },
};
