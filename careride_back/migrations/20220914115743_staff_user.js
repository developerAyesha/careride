/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  await knex.raw("INSERT INTO `staff_inf` VALUES (0,'careAdm','$2b$10$4s3FpG7xsrArEk4EsjNPHuSwiIitKo1.2wcg6RbMXTgxKQScd1AzO','careAdmin','','','a',0,1,'','en','','2022-08-24 12:59:43','2022-07-15 15:40:43',NULL)");

};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  
};
