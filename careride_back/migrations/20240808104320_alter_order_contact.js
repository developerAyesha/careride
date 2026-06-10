/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  await knex.schema.alterTable('order_inf', function(t) {
    t.string('contact_first', 64).notNullable().default('').after('contact');
    t.string('contact_last', 64).notNullable().default('').after('contact_first');
    t.string('contact_phone', 16).notNullable().default('').after('contact_last');
  });

  await knex.schema.alterTable('order_hist', function(t) {
    t.string('contact_first', 64).notNullable().default('').after('contact');
    t.string('contact_last', 64).notNullable().default('').after('contact_first');
    t.string('contact_phone', 16).notNullable().default('').after('contact_last');
  });

};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  
};
