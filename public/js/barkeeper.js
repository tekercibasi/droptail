import { dom, elements } from './dom.js';
import { api } from './api.js';

// Initialisiere die App, sobald das Dokument geladen ist
document.addEventListener('DOMContentLoaded', () => {
    // Mappe die DOM-Elemente
    dom.mapping();
    // Lade Cocktails und Bestellungen
    loadCocktails();
    loadOrders();
    
    // Füge Event-Listener für das Formular und die Modals hinzu
    dom.$('#cocktail-form').addEventListener('submit', handleFormSubmit);
    dom.$('#closeModal').addEventListener('click', closeRecipeModal);
    dom.$('#closeImageModal').addEventListener('click', closeImageModal);
    dom.$('#closeCreateCocktailModal').addEventListener('click', closeCreateCocktailModal);
    dom.$('#addNewCocktail').addEventListener('click', showCreateCocktailModal);
});

// Optionen für den Bearbeitungsmodus
let isEditMode = false;
let editCocktailId = null;
let editCocktailRev = null;

// Lade die Liste der Cocktails
const loadCocktails = () => {
    api.get('/api/cocktails')
        .then(cocktails => {
            elements.cocktailList.innerHTML = '';
            cocktails.forEach(cocktail => {
                // Überprüfe, ob alle notwendigen Daten vorhanden sind
                if (cocktail.title && cocktail.description && cocktail.ingredients && cocktail.recipe && cocktail.image) {
                    // Erstelle Listenelemente für jeden Cocktail
                    const listItem = dom.create('li', { class: 'list-group-item d-flex  mt-3"' },
                        dom.create('img', { src: cocktail.image, class: 'thumbnail', alt: cocktail.title, onclick: () => showImageModal(cocktail.image) }),
                        dom.create('p', { class: 'text mt-0', }, dom.create('span', { class: 'headline' }, `${cocktail.title}`),
                            `: ${cocktail.description}`),
                        dom.create('button', { class: 'btn btn-warning btn-lg', onclick: () => prepareEditCocktail(cocktail._id, cocktail._rev, cocktail.title, cocktail.description, cocktail.ingredients, cocktail.recipe, cocktail.image) }, 'Edit'),
                        dom.create('button', {
                            class: 'btn btn-danger btn-lg', onclick: () => {
                                if (window.confirm(`Do you really want to delete the ${cocktail.title} from cocktail-database? `)) {
                                    deleteCocktail(cocktail._id, cocktail._rev);
                                }
                            }
                        }, '🗑')
                    );
                    // Füge das Listenelement der Cocktail-Liste hinzu
                    elements.cocktailList.appendChild(listItem);
                } else {
                    console.error('Missing data for cocktail:', cocktail);
                }
            });
        })
        .catch(error => console.error('Error loading cocktails:', error));
}

// Formular-Submit-Handler
const handleFormSubmit = (event) => {
    event.preventDefault();
    // Referenziere das Formular-Element
    const form = event.target;
    const formData = new FormData(form);

    // Überprüfe, ob alle erforderlichen Felder ausgefüllt sind
    if (!formData.get('title') || !formData.get('description') || !formData.get('ingredients') || !formData.get('recipe')) {
        alert('Please fill in all required fields');
        return;
    }

    // Entscheide, ob ein neuer Cocktail erstellt oder ein bestehender bearbeitet wird
    if (isEditMode) {
        editCocktail(editCocktailId, editCocktailRev, formData);
    } else {
        createCocktail(formData);
    }
}

// Erstelle einen neuen Cocktail
const createCocktail = (formData) => {
    api.post('/api/cocktails', formData)
        .then(() => {
            alert('Cocktail created successfully');
            elements.cocktailForm.reset();
            loadCocktails();
        })
        .catch(error => console.error('Error creating cocktail:', error));
}

// Bereite die Bearbeitung eines Cocktails vor
const prepareEditCocktail = (id, rev, title, description, ingredients, recipe, image) => {
    showCreateCocktailModal(title, description, ingredients);
    dom.$('#title').value = title;
    dom.$('#description').value = description;
    dom.$('#ingredients').value = ingredients;
    dom.$('#recipe').value = recipe;

    // Zeige das Bild des Cocktails an, falls vorhanden
    if (image) {
        const imagePreview = dom.$('#image-preview');
        if (!imagePreview) {
            const imgElement = dom.create('img', { id: 'image-preview', src: image, alt: 'Current image', style: 'max-width: 100px; display: block; margin-bottom: 10px;' });
            dom.$('#image').insertAdjacentElement('beforebegin', imgElement);
        } else {
            imagePreview.src = image;
        }
    }

    // Setze den Bearbeitungsmodus
    isEditMode = true;
    editCocktailId = id;
    editCocktailRev = rev;

    if (elements.formTitle && elements.formButton) {
        elements.formTitle.textContent = 'Edit Cocktail';
        elements.formButton.textContent = 'Update Cocktail';
    } else {
        console.error('Form title or button not found');
    }
}

// Bearbeite einen bestehenden Cocktail
const editCocktail = (id, rev, formData) => {
    formData.append('_rev', rev);
    api.put(`/api/cocktails/${id}`, formData)
        .then(() => {
            alert('Cocktail updated successfully');
            elements.cocktailForm.reset();
            elements.formTitle.textContent = 'Create New Cocktail';
            elements.formButton.textContent = 'Create Cocktail';
            isEditMode = false;
            editCocktailId = null;
            editCocktailRev = null;
            const imagePreview = dom.$('#image-preview');
            if (imagePreview) imagePreview.remove();
            loadCocktails();
        })
        .catch(error => console.error('Error updating cocktail:', error));
}

// Lösche einen Cocktail
const deleteCocktail = (id, rev) => {
    api.delete(`/api/cocktails/${id}?rev=${rev}`)
        .then(() => {
            alert('Cocktail deleted successfully');
            loadCocktails();
        })
        .catch(error => console.error('Error deleting cocktail:', error));
}

// Lade die Liste der Bestellungen
const loadOrders = () => {
    api.get('/api/orders')
        .then(orders => {
            elements.orderList.innerHTML = '';
            elements.orderHistory.innerHTML = '';
            orders.forEach(order => {
                if (order.status === 'pending' || order.status === 'in progress') {
                    let cocktailId = order.cocktailId; // Angenommen, cocktailId ist die ID des Cocktails
                    api.get(`/api/cocktails/${cocktailId}`)
                        .then(cocktail => {
                            const listItem = dom.create('li', { class: 'list-group-item', id: `order-${order._id}` },
                                dom.create('div', { class: 'item-info' },
                                    `Order ${order._id}: ${cocktail.title} - ${order.customizations} (Quantity: ${order.quantity || 1})`
                                ),
                                dom.create('div', { class: 'btn-group' },
                                    dom.create('button', { class: 'btn btn-info btn-lg ', title: 'Show Recipe', onclick: () => showRecipeModal(cocktail) }, '📄'),
                                    dom.create('button', { class: 'btn btn-warning btn-lg', title: 'Mark as "in progress"', onclick: () => updateOrderStatus(order._id, 'in progress') }, 'Mark as In Progress'),
                                    dom.create('button', { class: 'btn btn-success btn-lg ', title: 'Mark as "served"', onclick: () => updateOrderStatus(order._id, 'served') }, 'Mark as Served')
                                ));
                            elements.orderList.appendChild(listItem);
                        })
                        .catch(error => console.error('Error fetching cocktail details:', error));
                } else if (order.status === "served") {
                    let cocktailId = order.cocktailId; // Angenommen, cocktailId ist die ID des Cocktails
                    api.get(`/api/cocktails/${cocktailId}`)
                        .then(cocktail => {
                            const listItem = dom.create('li', { class: 'list-group-item', id: `order-${order._id}` },
                                dom.create('div', { class: 'item-info' },
                                    `Order ${order._id}: ${cocktail.title} - ${order.customizations} (Quantity: ${order.quantity || 1})`,
                                ),
                                dom.create('div', { class: 'btn-group' },
                                    dom.create('button', {
                                        class: 'btn btn-danger btn-lg',
                                        title: 'Delete order"',
                                        onclick: () => {
                                            if (window.confirm(`Do you really want to delete ${order._id}?`)) {
                                                updateOrderStatus(order._id, 'deleted')
                                            }
                                        }
                                    }, '🗑'),
                                    dom.create('button', { class: 'btn btn-warning btn-lg', title: 'Send back to "pending"', onclick: () => updateOrderStatus(order._id, 'pending') }, 'Send back to "pending"'))
                            );
                            elements.orderHistory.appendChild(listItem);
                        })
                        .catch(error => console.error('Error fetching cocktail details:', error));
                } else {
                    return;
                }
            });
        })
        .catch(error => console.error('Error loading orders:', error));
}

// Aktualisiere den Status einer Bestellung
const updateOrderStatus = (orderId, status) => {
    api.put(`/api/orders/${orderId}/status`, { status })
        .then(() => {
            alert(`Order marked as ${status}`);
            loadOrders();
        })
        .catch(error => console.error('Error updating order status:', error));
}

// Zeige das Modal zum Erstellen eines neuen Cocktails
const showCreateCocktailModal = (title, ingredients, description) => {
    dom.$('#createCocktailModal form').reset();
    let image = dom.$('#createCocktailModal #image-preview');
    if (image)
        image.style.display = 'none';
    console.log(typeof title);
    if (typeof title === 'string') {
        dom.$('#createCocktailModal .modal-title').textContent = title;
    } else {
        dom.$('#createCocktailModal .modal-title').textContent = "Gimme some good flavors...";
        if (elements.formTitle && elements.formButton) {
            elements.formTitle.textContent = 'Create new Cocktail';
            elements.formButton.textContent = 'Create Cocktail';
        } else {
            console.error('Form title or button not found');
        }
    }
    dom.$('#createCocktailModal').style.display = 'block';
}

// Schließe das Modal zum Erstellen eines neuen Cocktails
const closeCreateCocktailModal = () => {
    dom.$('#createCocktailModal').style.display = 'none';
}

// Splitte die Zutaten in eine Liste von DOM-Elementen
const splitIngredients = (ingredients) => {
    let ingredientList = ingredients.trim().split(',');

    elements.ingredientListElement = dom.create('div', { class: 'btn-group' });

    ingredientList.forEach(ingredient => {
        const listItem = dom.create('button', { class: 'btn btn-outline-dark' }, ingredient.trim());
        elements.ingredientListElement.appendChild(listItem);
    });
    return elements.ingredientListElement;
};

// Zeige das Rezept-Modal
const showRecipeModal = (cocktail) => {
    dom.$('#modal-title').textContent = cocktail.title;
    dom.$('#modal-ingredients').appendChild(splitIngredients(cocktail.ingredients));
    dom.$('#modal-recipe').textContent = cocktail.recipe;
    dom.$('#recipeModal').style.display = 'block';
}

// Schließe das Rezept-Modal
const closeRecipeModal = () => {
    dom.$('#recipeModal').style.display = 'none';
}

// Zeige das Bild-Modal
const showImageModal = (imageSrc) => {
    dom.$('#modal-image').src = imageSrc;
    dom.$('#imageModal').style.display = 'block';
}

// Schließe das Bild-Modal
const closeImageModal = () => {
    dom.$('#imageModal').style.display = 'none';
}
