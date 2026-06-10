/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {

  await knex.schema.createTable('order_vendor', function(t) {
    t.integer('order_id').unsigned().notNullable();
    t.integer('vendor_id').unsigned().notNullable().index();
  });


};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  
};
