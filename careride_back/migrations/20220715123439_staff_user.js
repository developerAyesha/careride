/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  await knex.schema.createTable('staff_inf', function(t) {
    t.increments('id').unsigned().primary();
    t.string('login', 32).notNullable().unique();
    t.string('passw', 64).notNullable().default('');
    t.string('name', 128).notNullable().default('');
    t.string('email', 64).notNullable().default('');
    t.string('phone', 32).notNullable().default('');
    t.specificType('role', 'char(2)').notNullable().default('');
    t.specificType('block', 'tinyint(1)').unsigned().notNullable().default(0);
    t.integer('gid').unsigned().notNullable().default(0);
    t.string('avatar', 64).notNullable().default('');
    t.specificType('language', 'char(2)').notNullable().default('');
    t.specificType('token', 'char(128)').notNullable().default('');

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
