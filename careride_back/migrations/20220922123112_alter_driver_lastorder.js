/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  await knex.schema.alterTable('driver_inf', function(t) {
    t.integer('lastorder_id').unsigned().notNullable().default(0).after('license');
    t.decimal('rang', 4, 2).notNullable().default(0).after('lastorder_id');
  });

};


/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  
};
