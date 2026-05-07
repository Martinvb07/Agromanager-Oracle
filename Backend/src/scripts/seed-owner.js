import { usuariosService } from '../services/usuarios.service.js';
import { query, closePool } from '../config/db.js';

async function main() {
  const email = process.env.SEED_OWNER_EMAIL;
  const password = process.env.SEED_OWNER_PASSWORD;
  const nombre = process.env.SEED_OWNER_NAME || 'Owner';

  if (!email || !password) {
    console.error(
      'Missing SEED_OWNER_EMAIL / SEED_OWNER_PASSWORD.\n' +
        'Example:\n' +
        '  SEED_OWNER_EMAIL=owner@agromanager.local SEED_OWNER_PASSWORD=ChangeMe123! node src/scripts/seed-owner.js'
    );
    process.exit(2);
  }

  const existing = await query(
    `SELECT id FROM usuarios WHERE LOWER(rol) = 'owner' FETCH FIRST 1 ROWS ONLY`
  );

  if (existing.rows?.[0]) {
    const ownerId = existing.rows[0].ID ?? existing.rows[0].id;
    console.log(`Owner already exists (id=${ownerId}). Nothing to do.`);
    await closePool();
    process.exit(0);
  }

  const user = await usuariosService.createUser({
    nombre,
    email,
    password,
    rol: 'owner',
  });

  console.log(`Owner created: id=${user.id} email=${user.email}`);
  console.log('You can now login and create more users via /owner/users.');
  await closePool();
}

main().catch(async (err) => {
  console.error(err);
  try { await closePool(); } catch (_) { /* noop */ }
  process.exit(1);
});
