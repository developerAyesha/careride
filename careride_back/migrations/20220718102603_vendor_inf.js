/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  await knex.schema.createTable('vendor_inf', function(t) {
    t.increments('id').unsigned().primary();
    t.string('login', 32).notNullable().unique();
    t.string('passw', 64).notNullable().default('');
    t.specificType('status', 'tinyint(1)').unsigned().notNullable().default(0);
    t.specificType('block', 'tinyint(1)').unsigned().notNullable().default(0);
    t.string('company_name', 64).notNullable().default('');
    t.string('first_name', 64).notNullable().default('');
    t.string('second_name', 64).notNullable().default('');
    t.string('last_name', 64).notNullable().default('');
    t.string('email', 64).notNullable().default('');
    t.string('avatar', 64).notNullable().default('');
    t.string('address', 64).notNullable().default('');
    t.string('city', 32).notNullable().default('');
    t.string('state', 4).notNullable().default('');
    t.integer('zipcode').unsigned().notNullable().default(0);
    t.string('license', 32).notNullable().default('');
    t.string('car_count', 4).notNullable().default('');
    t.string('driver_count', 4).notNullable().default('');
    t.specificType('token', 'char(128)').notNullable().default('');
    t.dateTime('approveAt').nullable();
    t.dateTime('lastAt').nullable();
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
