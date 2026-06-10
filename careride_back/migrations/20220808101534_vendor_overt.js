/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  await knex.schema.createTable('vendor_overt', function(t) {
    t.increments('id').unsigned().primary();
    t.integer('vendor_id').unsigned().index();
    t.integer('timefrom').unsigned().notNullable().default(0);
    t.integer('timeto').unsigned().notNullable().default(0);
    t.decimal('price', 6, 2).notNullable().default(0);

    t.dateTime('createdAt').nullable();
    t.dateTime('updatedAt').nullable();
  });

  await knex.schema.alterTable('vendor_inf', function(t) {
    t.string('license', 160).notNullable().default('').alter();
  });

};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  
};
