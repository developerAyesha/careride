/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  await knex.schema.alterTable('vendor_inf', function(t) {
    t.decimal('costmt1', 6, 2).notNullable().default(0).after('license');
    t.decimal('costmt2', 6, 2).notNullable().default(0).after('costmt1');
  });

};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  
};
