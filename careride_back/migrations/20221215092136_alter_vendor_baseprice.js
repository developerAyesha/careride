/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {

  await knex.schema.alterTable('vendor_inf', function(t) {
    t.renameColumn('baseprice', 'baseprice1');
  });
  await knex.schema.alterTable('vendor_inf', function(t) {
    t.decimal('baseprice2', 6, 2).notNullable().default(0.5).after('baseprice1');
  });

};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  
};
