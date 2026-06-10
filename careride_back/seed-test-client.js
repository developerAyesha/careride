/**
 * Run once: node seed-test-client.js
 * Creates a test client account for demos / Loom recordings.
 */
const bcrypt = require('bcrypt');
const knex = require('knex')({
  client: 'mysql2',
  connection: { socketPath: '\\\\.\\pipe\\MySQL', user: 'root', password: '', database: 'careride_db' },
});

async function seed() {
  const LOGIN    = '+12025550199';
  const PASSWORD = 'CareRide2026';

  const existing = await knex('user_inf').where({ login: LOGIN }).first();
  if (existing) {
    console.log('Test client already exists — login:', LOGIN, '/ password:', PASSWORD);
    await knex.destroy(); return;
  }

  const hash = bcrypt.hashSync(PASSWORD, 10);
  const [id] = await knex('user_inf').insert({
    login:       LOGIN,
    passw:       hash,
    first_name:  'Demo',
    last_name:   'Client',
    email:       'demo@careride.test',
    block:       0,
    activated:   1,
    createdAt:   new Date(),
    updatedAt:   new Date(),
  });

  console.log('✅ Test client created (ID:', id, ')');
  console.log('   Phone:   ', LOGIN);
  console.log('   Password:', PASSWORD);
  await knex.destroy();
}

seed().catch(e => { console.error(e.message); process.exit(1); });
