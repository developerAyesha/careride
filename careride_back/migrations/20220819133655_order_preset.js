/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  await knex.schema.createTable('order_preset', function(t) {
    t.increments('id').unsigned().primary();
    t.integer('client_id').unsigned().notNullable().index();
    t.integer('vendor_id').unsigned().notNullable().default(0);
    t.string('title', 64).notNullable().default('');

    t.specificType('whoride', 'tinyint(1)').unsigned().notNullable().default(0);
    t.specificType('cartype', 'tinyint(1)').unsigned().notNullable().default(0);
    t.decimal('weight', 6, 2).notNullable().default(0);
    t.decimal('height', 6, 2).notNullable().default(0);
    t.string('gender', 1).notNullable().default('');
    t.integer('datebirth').unsigned().notNullable().default(0);
    t.specificType('wheelchair', 'tinyint(1)').unsigned().notNullable().default(0);
    t.specificType('escort', 'tinyint(1)').unsigned().notNullable().default(0);

    t.integer('services').unsigned().notNullable().default(0);
    t.string('contact', 16).notNullable().default('');
    t.text('instruction', 'text').notNullable().default('');
    t.string('reason', 64).notNullable().default('');

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
