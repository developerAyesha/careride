/**
 * node gen-token.js
 * Creates test client if missing, prints a valid JWT token.
 */
const jwt    = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const knex   = require('knex')({
  client: 'mysql2',
  connection: { host: 'localhost', user: 'root', password: '', database: 'careride_db' },
});

const JWT_SECRET = 'careride_D949AwPzldhyir1czlQ';
const LOGIN      = '+12025550199';
const PASSWORD   = 'CareRide2026';

function makeToken(uId) {
  return jwt.sign(
    { exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 31, data: { uId, ur: 'c' } },
    JWT_SECRET
  );
}

async function run() {
  let user = await knex('user_inf').where({ login: LOGIN }).first();

  if (!user) {
    const hash = bcrypt.hashSync(PASSWORD, 10);
    const [id] = await knex('user_inf').insert({
      login: LOGIN, passw: hash,
      first_name: 'Demo', last_name: 'Client',
      email: 'demo@careride.test',
      block: 0, activated: 1,
      createdAt: new Date(), updatedAt: new Date(),
    });
    user = { id };
    console.log('✅ Test user created (ID:', id, ')');
  } else {
    console.log('✅ Found existing user (ID:', user.id, ')');
  }

  const token = makeToken(user.id);
  console.log('\n--- COPY THIS TOKEN ---\n');
  console.log(token);
  console.log('\n-----------------------\n');

  await knex.destroy();
}

run().catch(e => { console.error(e.message); process.exit(1); });
