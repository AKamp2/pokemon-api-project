const http = require('http');
const query = require('querystring');
const htmlHandler = require('./htmlResponses.js');
const jsonHandler = require('./jsonResponses.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

// parsing the body for post requests
const parseBody = (request, response, handler) => {
  const body = [];

  request.on('error', (err) => {
    console.dir(err);
    response.statusCode = 400;
    response.end();
  });

  request.on('data', (chunk) => {
    body.push(chunk);
  });

  request.on('end', () => {
    const bodyString = Buffer.concat(body).toString();
    const contentType = request.headers['content-type'];
    // console.log(contentType);

    // checking the content type
    if (contentType === 'application/x-www-form-urlencoded') {
      request.body = query.parse(bodyString);
    } else if (contentType === 'application/json') {
      request.body = JSON.parse(bodyString);
    } else {
      response.statusCode = 400; // Bad Request
      response.end();
      return;
    }

    handler(request, response);
  });
};

// handle POST requests
const handlePost = (request, response, parsedUrl) => {
  if (parsedUrl.pathname === '/api/addPokemon') {
    parseBody(request, response, jsonHandler.addPokemon);
  } else if (parsedUrl.pathname === '/api/addRanking') {
    parseBody(request, response, jsonHandler.addRanking);
  }
};

// handle GET requests
const handleGet = (request, response, parsedUrl) => {
  // Serve CSS and JS
  if (parsedUrl.pathname === '/client-style.css') {
    htmlHandler.getCSS(request, response);
  } else if (parsedUrl.pathname === '/client.js') {
    htmlHandler.getJS(request, response);
  } else if (parsedUrl.pathname === '/api/getAllPokemon') {
    jsonHandler.getAllPokemon(request, response);
  } else if (parsedUrl.pathname === '/api/getWeaknesses') {
    jsonHandler.getPokemonWeaknesses(request, response);
  } else if (parsedUrl.pathname === '/api/getHeightWeight') {
    jsonHandler.getPokemonByHeightWeight(request, response);
  } else if (parsedUrl.pathname === '/api/getType') {
    jsonHandler.getPokemonByType(request, response);
  } else if (parsedUrl.pathname === '/doc.html') {
    htmlHandler.getDoc(request, response);
  } else if (parsedUrl.pathname === '/doc-style.css') {
    htmlHandler.getDocCSS(request, response);
  } else {
    htmlHandler.getIndex(request, response);
  }
};

// turning the query params into an object that can be parsed by jsonResponses
const extractQueryParams = (parsedUrl, request) => {
  request.queryParams = {};

  // Loop through params
  parsedUrl.searchParams.forEach((value, key) => {
    request.queryParams[key] = value;
  });
};

// function to handle requests
const onRequest = (request, response) => {
  const protocol = request.connection.encrypted ? 'https' : 'http';
  const parsedUrl = new URL(request.url, `${protocol}://${request.headers.host}`);

  // Extract query parameters
  extractQueryParams(parsedUrl, request);

  if (request.method === 'POST') {
    handlePost(request, response, parsedUrl);
  } else {
    handleGet(request, response, parsedUrl);
  }
};

http.createServer(onRequest).listen(port, () => {
  console.log(`Listening on 127.0.0.1: ${port}`);
});
