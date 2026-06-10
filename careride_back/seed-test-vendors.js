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
const bcrypt = require('bcrypt');

async function seed() {
  try {
    console.log('Creating test vendors...');

    // Common US cities (format: "City, State" as returned by Google Maps)
    const cities = [
      'New York, New York',
      'Los Angeles, California',
      'Chicago, Illinois',
      'Houston, Texas',
      'Philadelphia, Pennsylvania',
      'Phoenix, Arizona',
      'San Antonio, Texas',
      'San Diego, California',
      'Dallas, Texas',
      'San Jose, California',
      'Austin, Texas',
      'Jacksonville, Florida',
      'Fort Worth, Texas',
      'Columbus, Ohio',
      'Charlotte, North Carolina',
      'Indianapolis, Indiana',
      'Seattle, Washington',
      'Denver, Colorado',
      'Nashville, Tennessee',
      'Oklahoma City, Oklahoma',
    ];

    // Insert cities and get their IDs
    const cityIds = {};
    for (const city of cities) {
      const existing = await knex('cities').where({ title: city }).first();
      if (existing) {
        cityIds[city] = existing.id;
      } else {
        const [id] = await knex('cities').insert({ title: city, code: 0, createdAt: new Date() });
        cityIds[city] = id;
      }
      console.log(`City: ${city} -> ID: ${cityIds[city]}`);
    }

    const vendors = [
      { company: 'FastCare Transport', login: 'fastcare', first: 'John', last: 'Smith' },
      { company: 'MediRide Solutions', login: 'mediride', first: 'Sarah', last: 'Johnson' },
      { company: 'SafeWay Medical Transport', login: 'safeway', first: 'Mike', last: 'Williams' },
    ];

    const passHash = bcrypt.hashSync('Vendor1234', 10);

    for (const v of vendors) {
      // Check if vendor already exists
      const existing = await knex('vendor_inf').where({ login: v.login }).first();
      if (existing) {
        console.log(`Vendor ${v.login} already exists, skipping...`);
        continue;
      }

      // Insert vendor (status=1 = approved)
      const [vendorId] = await knex('vendor_inf').insert({
        login: v.login,
        passw: passHash,
        status: 1,
        block: 0,
        company_name: v.company,
        first_name: v.first,
        last_name: v.last,
        email: `${v.login}@test.com`,
        address: '123 Main St',
        city: 'New York, New York',
        state: 'NY',
        zipcode: 10001,
        services: 7,        // all services (1+2+4 = 7)
        baseprice1: 5.00,   // Wheelchair base price
        baseprice2: 8.00,   // Gurney base price
        costmt1: 2.50,      // Wheelchair $/mile
        costmt2: 3.50,      // Gurney $/mile
        token: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log(`Created vendor: ${v.company} (ID: ${vendorId})`);

      // Add vendor services
      const serviceData = [
        { vendor_id: vendorId, service_id: 1, price: 15.00, createdAt: new Date() }, // Oxygen
        { vendor_id: vendorId, service_id: 2, price: 10.00, createdAt: new Date() }, // Stairs
        { vendor_id: vendorId, service_id: 4, price: 20.00, createdAt: new Date() }, // Bariatric
      ];
      await knex('vendor_srvc').insert(serviceData);

      // Add 2 cars per vendor - one Wheelchair, one Gurney
      for (const cartype of [1, 2]) {
        const [carId] = await knex('car_inf').insert({
          vendor_id: vendorId,
          block: 0,
          busy: 0,
          model: cartype === 1 ? 'Toyota Sienna 2022' : 'Ford Transit 2022',
          plate: `TEST${vendorId}${cartype}`,
          color: cartype === 1 ? 'White' : 'Blue',
          cartype: cartype,
          city: 'New York, New York',
          city_id: cityIds['New York, New York'],
          city_radius: 500,
          pricemile: cartype === 1 ? 2.50 : 3.50,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        console.log(`  Created car ID ${carId} (type ${cartype === 1 ? 'Wheelchair' : 'Gurney'})`);

        // Assign car to ALL cities
        for (const city of cities) {
          await knex('car_city').insert({
            car_id: carId,
            city_id: cityIds[city],
          });
        }
        console.log(`  Assigned car ${carId} to ${cities.length} cities`);
      }
    }

    console.log('\n✅ Test vendors created successfully!');
    console.log('\nVendor Login Credentials:');
    console.log('  Login: fastcare / mediride / safeway');
    console.log('  Password: Vendor1234');
    console.log('\nCities covered:', cities.length, 'major US cities');

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await knex.destroy();
  }
}

seed();
