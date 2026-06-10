/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  await knex.schema.createTable('pay_inf', function(t) {
    t.increments('id').unsigned().primary();
    t.integer('order_id').unsigned().notNullable().default(0).index();
    t.integer('client_id').unsigned().notNullable();
    t.specificType('status', 'tinyint(1)').unsigned().notNullable().default(0);
    t.specificType('holded', 'tinyint(1)').unsigned().notNullable().default(0);

    t.string('payment_id', 64).notNullable().default('').index();
    t.integer('amount').unsigned().notNullable().default(0);
    t.string('token', 128).notNullable().default('');
    t.string('paiment_tx', 128).notNullable().default('');
    t.text('detail', 'text').notNullable().default('');

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
