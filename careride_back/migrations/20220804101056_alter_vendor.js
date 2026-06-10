/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  await knex.schema.alterTable('vendor_inf', function(t) {
    t.integer('car_free').unsigned().notNullable().default(0).after('car_count');
    t.integer('driver_free').unsigned().notNullable().default(0).after('driver_count');
    t.integer('services').unsigned().notNullable().default(0).after('costmt2');
  });

  await knex.schema.alterTable('car_inf', function(t) {
    t.integer('busy').unsigned().notNullable().default(0).after('vendor_id');
  });

  await knex.schema.alterTable('driver_inf', function(t) {
    t.integer('busy').unsigned().notNullable().default(0).after('vendor_id');
  });


};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  
};
