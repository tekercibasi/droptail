export const dom = {
    create(tag, attrs = {}, ...children) {
        const element = document.createElement(tag); // Erstellt ein neues Element
        for (let [key, value] of Object.entries(attrs)) {
            if (key.startsWith('on') && typeof value === 'function') {
                element.addEventListener(key.substring(2).toLowerCase(), value); // Fügt Event-Listener hinzu
            } else {
                element.setAttribute(key, value); // Setzt Attribute
            }
        }
        for (let child of children) {
            if (typeof child === 'string') {
                child = document.createTextNode(child); // Fügt Textknoten hinzu
            }
            element.appendChild(child); // Fügt Kinderknoten hinzu
        }
        return element; // Gibt das erstellte Element zurück
    },
    mapping() {
        // Mapped relevante DOM-Elemente
        elements.formTitle = this.$('#form-title');
        elements.formButton = this.$('#form-button');
        elements.cocktailForm = dom.$('#cocktail-form');
        elements.orderList = dom.$('#order-list .list-group');
        elements.orderHistory = dom.$('#order-history .list-group');
        elements.cocktailList = dom.$('#cocktail-list .list-group');
        elements.searchBar = dom.$('#search-cocktail');
    },
    $(selector, context = document) {
        return context.querySelector(selector); // Gibt das erste passende Element zurück
    },
    $$(selector, context = document) {
        return Array.from(context.querySelectorAll(selector)); // Gibt alle passenden Elemente als Array zurück
    }
};

export const elements = {}; // Exportiert die Elemente
