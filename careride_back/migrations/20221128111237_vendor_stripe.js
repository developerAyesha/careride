/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  await knex.schema.createTable('vendor_stripe', function(t) {
    t.increments('id').unsigned().primary();
    t.integer('acc_complete').unsigned().notNullable().default(0);
    t.string('acc_id', 64).notNullable().default('');

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
