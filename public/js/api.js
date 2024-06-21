export const api = {
    get(url) {
        return fetch(url).then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`); // Fehlerbehandlung bei fehlgeschlagenen HTTP-Anfragen
            }
            return response.json(); // Gibt die JSON-Antwort zurück
        });
    },
    post(url, data) {
        let options = {
            method: 'POST',
            body: data
        };

        if (!(data instanceof FormData)) { // Setzt Header für JSON-Daten
            options.headers = { 'Content-Type': 'application/json' };
            options.body = JSON.stringify(data);
        }

        return fetch(url, options).then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        });
    },
    put(url, data) {
        let options = {
            method: 'PUT',
            body: data
        };

        if (!(data instanceof FormData)) { // Setzt Header für JSON-Daten
            options.headers = { 'Content-Type': 'application/json' };
            options.body = JSON.stringify(data);
        }

        return fetch(url, options).then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        });
    },
    delete(url) {
        return fetch(url, { method: 'DELETE' }).then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        });
    }
};
