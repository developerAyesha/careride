/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  await knex.schema.createTable('car_inf', function(t) {
    t.increments('id').unsigned().primary();
    t.specificType('block', 'tinyint(1)').unsigned().notNullable().default(0);
    t.integer('vendor_id').unsigned().notNullable().index();
    t.string('model', 64).notNullable().default('');
    t.string('plate', 32).notNullable().default('');
    t.string('color', 32).notNullable().default('');
    t.specificType('cartype', 'tinyint(1)').unsigned().notNullable().default(0);
    t.string('city', 64).notNullable().default('');
    t.integer('city_id').unsigned().notNullable().index();
    t.decimal('pricemile', 8, 2).notNullable().default(0);

    t.dateTime('createdAt').nullable();
    t.dateTime('updatedAt').nullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  
};
