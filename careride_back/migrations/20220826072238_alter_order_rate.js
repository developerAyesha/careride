/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  await knex.schema.alterTable('order_inf', function(t) {
    t.specificType('rate', 'tinyint(1)').unsigned().notNullable().default(0).after('covtst');
  });
  await knex.schema.alterTable('order_hist', function(t) {
    t.specificType('rate', 'tinyint(1)').unsigned().notNullable().default(0).after('covtst');
  });

};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  
};
