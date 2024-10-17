
// handles FETCH response
const handleResponse = async (response, parseResponse, contentId) => {
    const content = document.querySelector(contentId);

    switch (response.status) {
        case 200:
            content.innerHTML = '<b>Success</b>';
            break;
        case 201:
            content.innerHTML = '<b>Created</b>';
            break;
        case 204:
            content.innerHTML = '<b>Updated (No Content)</b>';
            return;
        case 400:
            content.innerHTML = '<b>Bad Request</b>';
            break;
        case 404:
            content.innerHTML = '<b>Resource Not Found</b>';
            break;
        default:
            content.innerHTML = 'Error code not implemented by client.';
            break;
    }

     // Add content length below the status code
     const contentLength = response.headers.get('content-length') || 0;
     content.innerHTML += `<p>Content length: ${contentLength}</p>`;

    // If we should parse a response
    if (parseResponse) {
        const obj = await response.json();
        if (obj.message) {
            content.innerHTML += `<p>${obj.message}</p>`;
        } else {
            const jsonString = JSON.stringify(obj);
            content.innerHTML += `<p>${jsonString}</p>`;
        }
    }
};

// function to construct URL with query parameters for GET requests
const buildUrlWithParams = (form) => {
    const url = form.getAttribute('action');
    const queryParams = new URLSearchParams(new FormData(form));
    // Remove the method parameter before returning the URL
    queryParams.delete('method');
    return `${url}?${queryParams.toString()}`;
};

// function to send POST requests
const sendPost = async (form, contentId) => {
    const url = form.getAttribute('action');
    const formData = new URLSearchParams(new FormData(form)).toString();

    // Make fetch request
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Accept: 'application/json',
        },
        body: formData,
    });

    handleResponse(response, true, contentId);
};

// function to send requests based on selected method
const requestUpdate = async (form, contentId) => {
    const url = buildUrlWithParams(form);
    const method = form.querySelector('input[name="method"]:checked').value;

    // Await fetch response
    const response = await fetch(url, {
        method,
        headers: {
            'Accept': 'application/json',
        },
    });

    handleResponse(response, method === 'GET', contentId);
};

const init = () => {
    const getAllPokemonForm = document.querySelector('#getAllPokemonForm');
    const getPokemonWeaknessesForm = document.querySelector('#getPokemonWeaknessesForm');
    const getPokemonByHeightWeightForm = document.querySelector('#getPokemonByHeightWeightForm');
    const getPokemonByTypeForm = document.querySelector('#getPokemonByTypeForm');
    const addPokemonForm = document.querySelector('#addPokemonForm');
    const addRankingForm = document.querySelector('#addRankingForm');

    getAllPokemonForm.addEventListener('submit', (e) => {
        e.preventDefault();
        requestUpdate(getAllPokemonForm, '#getAllPokemonContent');
    });

    getPokemonWeaknessesForm.addEventListener('submit', (e) => {
        e.preventDefault();
        requestUpdate(getPokemonWeaknessesForm, '#getPokemonWeaknessesContent');
    });

    getPokemonByHeightWeightForm.addEventListener('submit', (e) => {
        e.preventDefault();
        requestUpdate(getPokemonByHeightWeightForm, '#getPokemonByHeightWeightContent');
    });

    getPokemonByTypeForm.addEventListener('submit', (e) => {
        e.preventDefault();
        requestUpdate(getPokemonByTypeForm, '#getPokemonByTypeContent');
    });

    addPokemonForm.addEventListener('submit', (e) => {
        e.preventDefault();
        sendPost(addPokemonForm, '#addPokemonContent');
    });

    addRankingForm.addEventListener('submit', (e) => {
        e.preventDefault();
        sendPost(addRankingForm, '#addRankingContent');
    });
};

window.onload = init;