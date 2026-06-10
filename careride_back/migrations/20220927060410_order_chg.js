/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  await knex.schema.createTable('order_chg', function(t) {
    t.increments('id').unsigned().primary();
    t.integer('order_id').unsigned().notNullable();
    t.integer('vendor_id').unsigned().notNullable().index();
    t.specificType('status_from', 'tinyint(1)').unsigned().notNullable().default(0);
    t.specificType('status_to', 'tinyint(1)').unsigned().notNullable().default(0);
    t.integer('who_id').unsigned().notNullable().default(0);

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
