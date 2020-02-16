'use strict';
const express = require('express');
const app = express();
const pg = require('pg');
const cors = require('cors');
const morgan = require('morgan');

const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', err => console.error(err));

app.use(cors());
app.use(morgan('dev'));
app.use(express.static('./www'));

const database = require('./database.js');
const defaults = require('./middleware.js');
const routes = require('./routes.js');

app.set('view engine', 'ejs');
app.set('views', './server/views');

app.get('/', routes.homePageHandler);
app.get('/characters', routes.characterHandler);

app.use('*', defaults.notFoundHandler);
app.use(defaults.errorHandler);

app.put('/characters/:name', routes.userClick);

app.post('/', routes.charHandlebars);


function startServer() {
  let port = process.env.PORT || 3000;
  database.connect()
    .then(() => app.listen(port))
    .then(() => console.log(`Server Listening on ${port}`))
    .catch(errorHandler);
}





function errorHandler(error, response) {
  response.render('views/error.ejs', { error: 'These are not the droids you were looking for.' });
}

module.exports = {
  server: app,
  start: startServer
};
