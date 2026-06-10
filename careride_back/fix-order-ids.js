/**
 * Run once: node fix-order-ids.js
 * Removes corrupted orders with overflow IDs (>= 4000000000)
 * left by the integer-overflow bug in onPreCreate.
 */
const Config = require('./server/config');
const knex = require('knex')({
  client: 'mysql2',
  connection: {
    host: Config.DB_HOST,
    user: Config.DB_USER,
    password: Config.DB_PASSWORD,
    database: Config.DB_DATABASE,
  },
});

async function run() {
  const THRESHOLD = 4000000000;

  const bad_inf  = await knex('order_inf').where('id', '>=', THRESHOLD).select('id');
  const bad_hist = await knex('order_hist').where('id', '>=', THRESHOLD).select('id');

  console.log('Corrupted rows in order_inf :', bad_inf.map(r => r.id));
  console.log('Corrupted rows in order_hist:', bad_hist.map(r => r.id));

  if (bad_inf.length) {
    await knex('order_vendor').whereIn('order_id', bad_inf.map(r => r.id)).delete();
    await knex('order_inf').where('id', '>=', THRESHOLD).delete();
    console.log(`Deleted ${bad_inf.length} row(s) from order_inf`);
  }
  if (bad_hist.length) {
    await knex('order_hist').where('id', '>=', THRESHOLD).delete();
    console.log(`Deleted ${bad_hist.length} row(s) from order_hist`);
  }

  // Show current max after cleanup
  const rows = await knex.raw('select max(B.d) as id FROM (select max(id) as d from order_inf UNION select max(id) as d from order_hist UNION select 1 as d) AS B');
  console.log('Max ID after cleanup:', rows[0][0].id);

  await knex.destroy();
  console.log('Done.');
}

run().catch(e => { console.error(e); process.exit(1); });
