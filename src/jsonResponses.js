const fs = require('fs');

const pokedexJSON = fs.readFileSync(`${__dirname}/../json/pokedex.json`);
const pokedexData = JSON.parse(pokedexJSON);

console.log('Pokemon data loaded:', pokedexData.length);

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

// Function to serve all Pokemon data
const getAllPokemon = (request, response) => {
  const responseJSON = pokedexData;
  respondJSON(request, response, 200, responseJSON); // Serve JSON data
};

// Function to fetch Pokemon weaknesses by name
const getPokemonWeaknesses = (request, response) => {
  const responseJSON = {
    weaknesses: [],
  };
  const { name } = request.queryParams; // Get the Pokemon name

  const pokemon = pokedexData.find((p) => p.name.toLowerCase() === name.toLowerCase());

  if (pokemon) {
    responseJSON.weaknesses = pokemon.weaknesses;
    respondJSON(request, response, 200, responseJSON);
  } else {
    responseJSON.message = 'Pokemon not found';
    respondJSON(request, response, 400, responseJSON);
  }
};

// Function to fetch Pokemon within specified height and weight ranges
const getPokemonByHeightWeight = (request, response) => {
  const responseJSON = {
    pokemon: [],
    message: '',
  };
  const {
    minHeight, maxHeight, minWeight, maxWeight,
  } = request.queryParams;

  // check if all the params exist
  if (!minHeight || !maxHeight || !minWeight || !maxWeight) {
    responseJSON.message = 'All fields (minHeight, maxHeight, minWeight, maxWeight) are required.';
    responseJSON.id = 'missingParams';
    return respondJSON(request, response, 400, responseJSON);
  }

  const parsedMinHeight = parseFloat(minHeight);
  const parsedMaxHeight = parseFloat(maxHeight);
  const parsedMinWeight = parseFloat(minWeight);
  const parsedMaxWeight = parseFloat(maxWeight);

  // check if they're all valid numbers
  if (Number.isNaN(parsedMinHeight) || Number.isNaN(parsedMaxHeight)
    || Number.isNaN(parsedMinWeight) || Number.isNaN(parsedMaxWeight)) {
    responseJSON.message = 'All fields must be valid numbers.';
    responseJSON.id = 'invalidParams';
    return respondJSON(request, response, 400, responseJSON);
  }

  const pokemonInRange = pokedexData.filter((p) => {
    const height = parseFloat(p.height);
    const weight = parseFloat(p.weight);
    return height >= parsedMinHeight && height <= parsedMaxHeight
      && weight >= parsedMinWeight && weight <= parsedMaxWeight;
  });

  if (pokemonInRange.length > 0) {
    responseJSON.pokemon = pokemonInRange;
    return respondJSON(request, response, 200, responseJSON);
  }
  responseJSON.message = 'No Pokemon found within the specified height and weight range.';
  responseJSON.id = 'notFound';
  return respondJSON(request, response, 404, responseJSON);
};

// Function to fetch Pokemon by type
const getPokemonByType = (request, response) => {
  const responseJSON = {
    pokemon: [],
  };

  const { type } = request.queryParams;

  // Check if type is provided
  if (!type) {
    responseJSON.message = 'Type is required.';
    responseJSON.id = 'missingParams';
    return respondJSON(request, response, 400, responseJSON);
  }

  const pokemonByType = pokedexData.filter((p) => p.type.includes(type));

  if (pokemonByType.length > 0) {
    responseJSON.pokemon = pokemonByType;
    return respondJSON(request, response, 200, responseJSON);
  }
  responseJSON.message = 'No Pokemon of this type found';
  responseJSON.id = 'notFound';
  return respondJSON(request, response, 404, responseJSON);
};

// Function to add a pokemon to the dex
const addPokemon = (request, response) => {
  const {
    name, num, type, height, weight,
  } = request.body;

  // Check if any required field is missing
  if (!name || !num || !type || !height || !weight) {
    const responseJSON = {
      message: 'All fields (name, num, type, height, weight) are required.',
      id: 'missingParams',
    };
    return respondJSON(request, response, 400, responseJSON);
  }

  // Check if num, height, and weight are valid numbers
  const parsedNum = parseFloat(num);
  const parsedHeight = parseFloat(height);
  const parsedWeight = parseFloat(weight);

  if (Number.isNaN(parsedNum) || Number.isNaN(parsedHeight) || Number.isNaN(parsedWeight)) {
    const responseJSON = {
      message: 'num, height, and weight must all be valid numbers.',
      id: 'invalidParams',
    };
    return respondJSON(request, response, 400, responseJSON);
  }

  // Check if a Pokemon with the same ID already exists
  const existingPokemon = pokedexData.find((p) => p.id === parsedNum); // Check by ID instead of num
  if (existingPokemon) {
    const responseJSON = {
      message: `A Pokemon with the ID ${num} already exists.`,
      id: 'duplicateID',
    };
    return respondJSON(request, response, 400, responseJSON);
  }

  // Create a new object with "kg" and "m" suffixes
  const newPokemon = {
    id: parsedNum,
    num,
    name,
    img: '',
    type: Array.isArray(type) ? type : [type],
    height: `${parsedHeight} m`,
    weight: `${parsedWeight} kg`,
    weaknesses: [],
    next_evolution: [],
  };

  pokedexData.push(newPokemon);

  const responseJSON = {
    message: 'New Pokemon created successfully!',
    newPokemon,
  };
  return respondJSON(request, response, 201, responseJSON);
};

// Function adds a ranking to a pokemon
const addRanking = (request, response) => {
  const responseJSON = {};
  const { name, ranking } = request.body;

  if (!name || !ranking) {
    responseJSON.message = 'Both Pokemon name and ranking are required.';
    responseJSON.id = 'missingParams';
    return respondJSON(request, response, 400, responseJSON);
  }

  const pokemon = pokedexData.find((p) => p.name.toLowerCase() === name.toLowerCase());

  if (!pokemon) {
    responseJSON.message = 'Pokemon not found.';
    responseJSON.id = 'notFound';
    return respondJSON(request, response, 404, responseJSON);
  }

  if (!pokemon.ranking) {
    pokemon.ranking = ranking;
    responseJSON.message = `Ranking added to ${pokemon.name}.`;
    responseJSON.pokemon = pokemon;
    return respondJSON(request, response, 201, responseJSON);
  }
  pokemon.ranking = ranking;
  return respondJSON(request, response, 204, null);
};

// function for 404 not found requests with message
const notFound = (request, response) => {
  const responseJSON = {
    message: 'The page you are looking for was not found.',
    id: 'notFound',
  };

  respondJSON(request, response, 404, responseJSON);
};

module.exports = {
  getAllPokemon,
  getPokemonWeaknesses,
  getPokemonByHeightWeight,
  getPokemonByType,
  addPokemon,
  addRanking,
  notFound,
};
