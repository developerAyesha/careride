/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {

  await knex.schema.createTable('order_inf', function(t) {
    t.increments('id').unsigned().primary();
    t.specificType('status', 'tinyint(1)').unsigned().notNullable().default(0);
    t.integer('client_id').unsigned().notNullable().index();
    t.integer('vendor_id').unsigned().notNullable().index();
    t.integer('car_id').unsigned().notNullable();
    t.integer('driver_id').unsigned().notNullable().index();

    t.string('pfrom_addr', 64).notNullable().default('');
    t.string('pfrom_city', 32).notNullable().default('');
    t.integer('pfrom_city_id').unsigned().notNullable();
    t.string('pto_addr', 64).notNullable().default('');
    t.string('pto_city', 32).notNullable().default('');
    t.integer('pto_city_id').unsigned().notNullable();
    t.text('p_dat', 'text').notNullable().default('');

    t.decimal('distance', 6, 2).notNullable().default(0);
    t.decimal('price', 6, 2).notNullable().default(0);
    t.specificType('whoride', 'tinyint(1)').unsigned().notNullable().default(0);
    t.specificType('cartype', 'tinyint(1)').unsigned().notNullable().default(0);
    t.decimal('weight', 6, 2).notNullable().default(0);
    t.decimal('height', 6, 2).notNullable().default(0);
    t.string('gender', 1).notNullable().default('');
    t.integer('datebirth').unsigned().notNullable();
    t.specificType('wheelchair', 'tinyint(1)').unsigned().notNullable().default(0);
    t.specificType('escort', 'tinyint(1)').unsigned().notNullable().default(0);
    t.specificType('covtst', 'tinyint(1)').unsigned().notNullable().default(0);

    t.integer('services').unsigned().notNullable();
    t.string('overtime', 250).notNullable().default('');
    t.string('contact', 16).notNullable().default('');
    t.text('instruction', 'text').notNullable().default('');
    t.string('reason', 120).notNullable().default('');
    t.string('pricemk', 250).notNullable().default('');

    t.dateTime('payAt').nullable();
    t.dateTime('createdAt').nullable();
    t.dateTime('updatedAt').nullable();
  });

  await knex.schema.createTable('order_hist', function(t) {
    t.integer('id').unsigned().notNullable().primary();
    t.specificType('status', 'tinyint(1)').unsigned().notNullable().default(0);
    t.integer('client_id').unsigned().notNullable().index();
    t.integer('vendor_id').unsigned().notNullable().index();
    t.integer('car_id').unsigned().notNullable();
    t.integer('driver_id').unsigned().notNullable().index();

    t.string('pfrom_addr', 64).notNullable().default('');
    t.string('pfrom_city', 32).notNullable().default('');
    t.integer('pfrom_city_id').unsigned().notNullable();
    t.string('pto_addr', 64).notNullable().default('');
    t.string('pto_city', 32).notNullable().default('');
    t.integer('pto_city_id').unsigned().notNullable();
    t.text('p_dat', 'text').notNullable().default('');

    t.decimal('distance', 6, 2).notNullable().default(0);
    t.decimal('price', 6, 2).notNullable().default(0);
    t.specificType('whoride', 'tinyint(1)').unsigned().notNullable().default(0);
    t.specificType('cartype', 'tinyint(1)').unsigned().notNullable().default(0);
    t.decimal('weight', 6, 2).notNullable().default(0);
    t.decimal('height', 6, 2).notNullable().default(0);
    t.string('gender', 1).notNullable().default('');
    t.integer('datebirth').unsigned().notNullable();
    t.specificType('wheelchair', 'tinyint(1)').unsigned().notNullable().default(0);
    t.specificType('escort', 'tinyint(1)').unsigned().notNullable().default(0);
    t.specificType('covtst', 'tinyint(1)').unsigned().notNullable().default(0);

    t.integer('services').unsigned().notNullable();
    t.string('overtime', 250).notNullable().default('');
    t.string('contact', 16).notNullable().default('');
    t.text('instruction', 'text').notNullable().default('');
    t.string('reason', 120).notNullable().default('');
    t.string('pricemk', 250).notNullable().default('');

    t.dateTime('payAt').nullable();
    t.dateTime('createdAt').nullable();
    t.dateTime('updatedAt').nullable();
  });

  await knex.schema.createTable('vendor_srvc', function(t) {
    t.integer('vendor_id').unsigned().notNullable();
    t.integer('service_id').unsigned().notNullable();
    t.decimal('price', 6, 2).notNullable().default(0);
    t.dateTime('createdAt').nullable();
    t.dateTime('updatedAt').nullable();

    t.primary(['vendor_id', 'service_id']);
  });


};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  
};
