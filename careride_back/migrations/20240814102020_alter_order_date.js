/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  await knex.schema.alterTable('order_inf', function(t) {
    t.specificType('roundtrip', 'tinyint(1)').unsigned().notNullable().default(0).after('rate');
    t.dateTime('orderAt').nullable().after('utc_offset');
  });

  await knex.schema.alterTable('order_hist', function(t) {
    t.specificType('roundtrip', 'tinyint(1)').unsigned().notNullable().default(0).after('rate');
    t.dateTime('orderAt').nullable().after('utc_offset');
  });

  await knex('order_hist').update('orderAt', knex.raw('createdAt'));

};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  
};
