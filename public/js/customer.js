import { dom, elements } from './dom.js';
import { api } from './api.js';

const ws = new WebSocket('ws://localhost:3000'); // Establish WebSocket connection

ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === 'cocktail_created' || data.type === 'cocktail_updated' || data.type === 'cocktail_deleted') {
        loadCocktails();
    } else if (data.type === 'order_created' || data.type === 'order_updated') {
        loadOrderHistory();
    }
};

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    dom.mapping();
    loadCocktails();
    loadOrderHistory();

    // EventMapping
    dom.$('#closeModal').addEventListener('click', closeRecipeModal);
    dom.$('#closeImageModal').addEventListener('click', closeImageModal);
    elements.searchBar.addEventListener('input', () => {
        const searchTerm = elements.searchBar.value.toLowerCase();
        loadCocktails(searchTerm.split(' '));
    });
});

// Returns all objects, which include all search terms
function searchInObjectArray(array, searchStrings) {
    const results = [];

    function search(obj) {
        const foundTerms = new Set();

        function recursiveSearch(obj) {
            for (const key in obj) {
                if (typeof obj[key] === 'string') {
                    searchStrings.forEach(term => {
                        if (obj[key].includes(term)) {
                            foundTerms.add(term);
                        }
                    });
                } else if (Array.isArray(obj[key])) {
                    obj[key].forEach(item => recursiveSearch(item));
                } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                    recursiveSearch(obj[key]);
                }
            }
        }

        recursiveSearch(obj);

        if (searchStrings.every(term => foundTerms.has(term))) {
            results.push(obj);
        }
    }

    array.forEach(item => search(item));
    return results;
}

const loadCocktails = (searchTerm = []) => {
    api.get('/api/cocktails')
        .then(cocktails => {
            const cocktailList = dom.$('#cocktail-list');
            cocktailList.innerHTML = '';

            let foundItems = cocktails;
            if (searchTerm.length > 0) {
                foundItems = searchInObjectArray(cocktails, searchTerm);
            }

            foundItems.forEach(cocktail => {
                if (cocktail.title && cocktail.description && cocktail.ingredients && cocktail.recipe && cocktail.image) {
                    const listItem = dom.create('li', { class: 'list-group-item d-flex mb-2' },
                        dom.create('img', { src: cocktail.image, class: 'thumbnail', alt: cocktail.title, onclick: () => showImageModal(cocktail.image, cocktail.title) }),
                        dom.create('p', { class: 'text mb-0' }, dom.create('span', { class: 'headline' }, `${cocktail.title}`),
                            `: ${cocktail.description}`),
                        dom.create('button', { class: 'btn btn-info btn-lg', onclick: () => showRecipeModal(cocktail) }, 'View Recipe'),
                        dom.create('button', { class: 'btn btn-primary btn-lg', onclick: () => placeOrder(cocktail._id) }, 'Order')
                    );
                    cocktailList.appendChild(listItem);
                } else {
                    console.error('Missing data for cocktail:', cocktail);
                }
            });
        })
        .catch(error => console.error('Error loading cocktails:', error));
};

const placeOrder = (cocktailId) => {
    const customizations = prompt('Enter any customizations:');
    if (customizations !== null) {
        const orderData = {
            cocktailId,
            customizations
        };
        api.post('/api/orders', orderData)
            .then(() => {
                alert('Order placed successfully');
                loadOrderHistory();
            })
            .catch(error => console.error('Error placing order:', error));
    }
};

const updateOrderStatus = (orderId, status) => {
    api.put(`/api/orders/${orderId}/status`, { status })
        .then(() => {
            alert(`Order marked as ${status}`);
            loadOrders();
        })
        .catch(error => console.error('Error updating order status:', error));
}

const loadOrderHistory = () => {
    api.get('/api/orders')
        .then(orders => {
            const orderHistory = dom.$('#order-history');
            orderHistory.innerHTML = '';
            
            orders.forEach(order => {
                const cocktailId = order.cocktailId;
                api.get(`/api/cocktails/${cocktailId}`)
                    .then(cocktail => {
                        const listItem = dom.create('li', { class: 'list-group-item pt-3 pb-3 d-flex align-items-center' },
                            dom.create('p', { class: `mb-0 ${order.status == 'served' ? 'text-success' : ''} ${order.status == 'deleted' ? 'text-danger' : ''} ${order.status == 'pending' ? 'text-warning' : ''} ${order.status == 'in progress' ? 'text-info' : ''}` },
                                `Order ${order._id}: ${cocktail.title} - ${order.customizations} (Status: ${order.status})`
                            ),
                            dom.create('button', { class:  `btn btn-warning btn-lg ${order.status == 'pending' ? '' : 'd-none'}`, title: 'Mark as "in progress"', onclick: () => updateOrderStatus(order._id, 'deleted') }, 'Cancel Order' )
                        );
                        orderHistory.appendChild(listItem);
                    })
                    .catch(error => console.error('Error fetching cocktail details:', error));
            });

            if (orders.length === 0) {
                orderHistory.appendChild(dom.create('li',{class: 'list-group-item d-flex pt-2 pb-2'},'no orders yet.',));
                return;
            }
        })
        .catch(error => console.error('Error loading order history:', error));
};

const splitIngredients = (ingredients) => {
    let ingredientList = ingredients.trim().split(',');

    elements.ingredientListElement = dom.create('div', { class: 'btn-group' });

    ingredientList.forEach(ingredient => {
        const listItem = dom.create('button', { class: 'btn btn-outline-dark' }, ingredient.trim());
        elements.ingredientListElement.appendChild(listItem);
    });
    return elements.ingredientListElement;
};

const showRecipeModal = (cocktail) => {
    dom.$('#recipeModal .modal-title').textContent = 'Recipe: ' + cocktail.title;
    if (dom.$('#modal-ingredients')) {
        dom.$('#modal-ingredients').innerHTML = '';
        dom.$('#modal-ingredients').appendChild(splitIngredients(cocktail.ingredients));
    }
    dom.$('#modal-recipe').textContent = cocktail.recipe;
    dom.$('#recipeModal').style.display = 'block';
};

const closeRecipeModal = () => {
    dom.$('#recipeModal').style.display = 'none';
};

const showImageModal = (imageSrc, cocktailTitle) => {
    dom.$('#imageModal .modal-title').textContent = 'Image: ' + cocktailTitle;
    dom.$('#modal-image').src = imageSrc;
    dom.$('#imageModal').style.display = 'block';
};

const closeImageModal = () => {
    dom.$('#imageModal').style.display = 'none';
};
