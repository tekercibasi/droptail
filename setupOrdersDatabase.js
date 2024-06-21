const nano = require('nano')('http://admin:YOURPASSWORD@localhost:5984');
const ordersDbName = 'orders';

async function createDatabase() {
  try {
    await nano.db.create(ordersDbName);
    console.log(`Database ${ordersDbName} created.`);
  } catch (error) {
    if (error.statusCode === 412) {
      console.log(`Database ${ordersDbName} already exists.`);
    } else {
      throw error;
    }
  }
}

async function main() {
  try {
    await createDatabase();
    console.log('Orders database setup complete.');
  } catch (error) {
    console.error('Error setting up orders database:', error);
  }
}

main();
