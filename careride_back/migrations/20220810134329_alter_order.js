/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  await knex.schema.alterTable('order_inf', function(t) {
    t.integer('utc_offset').notNullable().default(0).after('pricemk');
    t.dateTime('acceptedAt').nullable().after('utc_offset');
  });

  await knex.schema.alterTable('order_hist', function(t) {
    t.integer('utc_offset').notNullable().default(0).after('pricemk');
    t.dateTime('acceptedAt').nullable().after('utc_offset');
  });

};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  
};
