const fs = require('fs');

// load files into memory
const index = fs.readFileSync(`${__dirname}/../client/client.html`);
const css = fs.readFileSync(`${__dirname}/../client/client-style.css`);
const doc = fs.readFileSync(`${__dirname}/../client/doc.html`);
const docCSS = fs.readFileSync(`${__dirname}/../client/doc-style.css`);
const js = fs.readFileSync(`${__dirname}/../client/client.js`);

// function to get the index page
const getIndex = (request, response) => {
  response.writeHead(200, {
    'Content-Type': 'text/html',
    'Content-Length': Buffer.byteLength(index, 'utf8'),
  });
  response.write(index);
  response.end();
};

// function to get CSS page
const getCSS = (request, response) => {
  response.writeHead(200, {
    'Content-Type': 'text/css',
    'Content-Length': Buffer.byteLength(css, 'utf8'),
  });
  response.write(css);
  response.end();
};

// function to get doc page
const getDoc = (request, response) => {
  response.writeHead(200, {
    'Content-Type': 'text/html',
    'Content-Length': Buffer.byteLength(doc, 'utf8'),
  });
  response.write(doc);
  response.end();
};

// function to get doc CSS page
const getDocCSS = (request, response) => {
  response.writeHead(200, {
    'Content-Type': 'text/css',
    'Content-Length': Buffer.byteLength(docCSS, 'utf8'),
  });
  response.write(docCSS);
  response.end();
};

// function to get client js page
const getJS = (request, response) => {
  response.writeHead(200, {
    'Content-Type': 'text/javascript',
    'Content-Length': Buffer.byteLength(js, 'utf8'),
  });

  response.write(js);
  response.end();
};

module.exports = {
  getIndex,
  getCSS,
  getDoc,
  getDocCSS,
  getJS,
};
