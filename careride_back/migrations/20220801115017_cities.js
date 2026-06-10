/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  await knex.schema.createTable('cities', function(t) {
    t.increments('id').unsigned().primary();
    t.integer('code').unsigned().notNullable().default(0).index();
    t.string('title', 64).notNullable().default('').index();
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
