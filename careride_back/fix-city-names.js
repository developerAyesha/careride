const Config = require('./server/config.js');
const knex = require('knex')({
  client: 'mysql2',
  connection: {
    host: Config.DB_HOST,
    user: Config.DB_USER,
    password: Config.DB_PASSWORD,
    database: Config.DB_DATABASE,
  }
});

// Google Maps returns "City, ST" with 2-letter state abbreviation
// These must match exactly what getCity() returns in the frontend helper
const cities = [
  'New York, NY',
  'Los Angeles, CA',
  'Chicago, IL',
  'Houston, TX',
  'Philadelphia, PA',
  'Phoenix, AZ',
  'San Antonio, TX',
  'San Diego, CA',
  'Dallas, TX',
  'San Jose, CA',
  'Austin, TX',
  'Jacksonville, FL',
  'Fort Worth, TX',
  'Columbus, OH',
  'Charlotte, NC',
  'Indianapolis, IN',
  'Seattle, WA',
  'Denver, CO',
  'Nashville, TN',
  'Oklahoma City, OK',
];

async function fix() {
  try {
    console.log('Fixing city name format to match Google Maps output...\n');

    // Step 1: insert cities with correct format and collect their IDs
    const cityIds = {};
    for (const city of cities) {
      const existing = await knex('cities').where({ title: city }).first();
      if (existing) {
        cityIds[city] = existing.id;
        console.log(`City exists: "${city}" -> ID ${existing.id}`);
      } else {
        const [id] = await knex('cities').insert({ title: city, code: 0, createdAt: new Date() });
        cityIds[city] = id;
        console.log(`City created: "${city}" -> ID ${id}`);
      }
    }

    // Step 2: find all test vendor cars (vendors with login in our test set)
    const testVendors = await knex('vendor_inf')
      .whereIn('login', ['fastcare', 'mediride', 'safeway'])
      .select(['id', 'company_name']);

    if (!testVendors.length) {
      console.log('\nNo test vendors found. Run seed-test-vendors.js first.');
      return;
    }

    const vendorIds = testVendors.map(v => v.id);
    const cars = await knex('car_inf').whereIn('vendor_id', vendorIds).select(['id', 'vendor_id']);
    console.log(`\nFound ${cars.length} cars for test vendors.`);

    // Step 3: for each car, add car_city entries for the new city IDs
    let added = 0;
    for (const car of cars) {
      for (const city of cities) {
        const cityId = cityIds[city];
        const exists = await knex('car_city').where({ car_id: car.id, city_id: cityId }).first();
        if (!exists) {
          await knex('car_city').insert({ car_id: car.id, city_id: cityId });
          added++;
        }
      }
    }

    console.log(`Added ${added} car_city entries with corrected city names.`);
    console.log('\nDone! Vendors should now appear when searching from US cities.');

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await knex.destroy();
  }
}

fix();
