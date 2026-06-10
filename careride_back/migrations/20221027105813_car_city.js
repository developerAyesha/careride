/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {

  await knex.schema.createTable('car_city', function(t) {
    t.integer('car_id').unsigned().notNullable();
    t.integer('city_id').unsigned().notNullable();
    t.primary(['car_id', 'city_id']);
  });

  await knex.schema.alterTable('car_inf', function(t) {
    t.integer('city_radius').unsigned().notNullable().default(0).after('city_id');
  });

};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  
};
