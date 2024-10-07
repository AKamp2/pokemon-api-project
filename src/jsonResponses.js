const fs = require('fs');

const pokedexJSON = fs.readFileSync(`${__dirname}/../json/pokedex.json`);
const pokedexData = JSON.parse(pokedexJSON);

console.log('Pokémon data loaded:', pokemonDex.length);


const respondJSON = (request, response, status, object) => {
    const content = JSON.stringify(object);
  
    const headers = {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(content, 'utf8'),
    };
  
    response.writeHead(status, headers);
  
    if (request.method !== 'HEAD') {
      response.write(content);
    }
  
    response.end();
  };


// Function to serve all Pokémon data
const getAllPokemon = (request, response) => {
    const responseJSON = pokedexData;
      respondJSON(request, response, 200, responseJSON) // Serve the in-memory JSON data
};

// Function to fetch Pokémon weaknesses by name
const getPokemonWeaknesses = (request, response) => {
    const responseJSON = {
        weaknesses: [],
        message: '',
      };
    const { name } = request.body; // Get the Pokémon name
    const pokemon = pokedexData.find(p => p.name.toLowerCase() === name.toLowerCase());
    
    if (pokemon) {
        responseJSON.weaknesses = pokemon.weaknesses;
        respondJSON(request, response, 200, responseJSON);
    } else {
        responseJSON.message = 'Pokemon not found'
        respondJSON(request, response, 404, responseJSON);
    }
};

// Function to fetch Pokémon within specified height and weight ranges
const getPokemonByHeightWeight = (request, response) => {
    const responseJSON = {
    pokemon: [],
    message: '',
      };
    const { minHeight, maxHeight, minWeight, maxWeight } = request.body; // Get height and weight

    const pokemonInRange = pokedexData.filter(p => {
        const height = parseFloat(p.height);
        const weight = parseFloat(p.weight);
        return height >= minHeight && height <= maxHeight && weight >= minWeight && weight <= maxWeight;
    });

    responseJSON.pokemon = pokemonInRange;
    respondJSON(request, response, 200, responseJSON);
};

// Function to fetch Pokémon by type
const getPokemonByType = (request, response) => {
    const responseJSON = {
        message: 'Name and age are both required.',
      };
    const { type } = request.body; // Get type

    const pokemonByType = pokedexData.filter(p => {
        p.type.includes(type)
    });
    
    if (pokemonByType.length > 0) {
        respondJSON(request, response, 200, { pokemon: pokemonByType });
    } else {
        respondJSON(request, response, 404, { error: `No Pokémon found of type ${type}` });
    }
};

module.exports = {
    getAllPokemon,
    getPokemonWeaknesses,
    getPokemonByHeightWeight,
    getPokemonByType,
};

