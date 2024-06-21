const nano = require('nano')('http://admin:YOURPASSWORD@localhost:5984');
const dbName = 'orders';

async function insertDummyOrders() {
    const db = nano.use(dbName);
    const dummyOrders = [
        { _id: 'order1', type: 'order', cocktailId: '1', customizations: 'No mint', status: 'pending' },
        { _id: 'order2', type: 'order', cocktailId: '2', customizations: 'Extra salt', status: 'in progress' },
        { _id: 'order3', type: 'order', cocktailId: '3', customizations: 'Less sugar', status: 'served' }
    ];

    try {
        await db.bulk({ docs: dummyOrders });
        console.log('Dummy orders inserted.');
    } catch (error) {
        console.error('Error inserting dummy orders:', error);
    }
}

insertDummyOrders();
