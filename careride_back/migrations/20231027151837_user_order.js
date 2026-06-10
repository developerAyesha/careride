/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {

  await knex.schema.createTable('user_order', function(t) {
    t.integer('client_id').unsigned().notNullable().index();
    t.integer('order_id').unsigned().notNullable().default(0);
  });

  await knex.schema.alterTable('order_inf', function(t) {
    t.string('pfrom_addr', 128).notNullable().default('').alter();
    t.string('pfrom_city', 64).notNullable().default('').alter();
    t.string('pto_addr', 128).notNullable().default('').alter();
    t.string('pto_city', 64).notNullable().default('').alter();
  });

  await knex.schema.alterTable('order_hist', function(t) {
    t.string('pfrom_addr', 128).notNullable().default('').alter();
    t.string('pfrom_city', 64).notNullable().default('').alter();
    t.string('pto_addr', 128).notNullable().default('').alter();
    t.string('pto_city', 64).notNullable().default('').alter();
  });


};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  
};
