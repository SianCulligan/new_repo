'use strict';

// **** 3rd Party Modules ****

// Superagent will let us call remote APIs for data
const superagent = require('superagent');

// **** Custom Modules ****

// Our database client. We'll use this to run queries
const database = require('./database.js');

// In the routes file, app.get('/') calls this function

function homePageHandler(req, res) {
  // Get page one of the API from star wars
  // THEN, render an EJS Template with that data
  fetchCharactersFromSWAPI(1)
    .then(data => res.render('index', data))
    .catch(errorHandler);
}

// Use superagent to get the star wars characters, by page
function fetchCharactersFromSWAPI(pageNumber) {
  return superagent.get(`https://swapi.co/api/people/?page=${pageNumber}`)
    .then(response => {
      return getNumberOfLikes(response.body)
    })
    .catch(errorHandler);
}

//use new array + .replace to iterate through page numbers? 
// let pageNumb = [];

function fetchMore(pageNumber) {
  return superagent.get(`https://swapi.co/api/people/?page=${pageNumber+1}`)
    .then(response => {
      return getNumberOfLikes(response.body)
    })
    .catch(errorHandler);
}

function charHandlebars () {
  let source = $('#charTemplate').html();
  let template = Handlebars.compile(source);
  return template(this);
}

function userClick (request, response) {
  let name = request.params.name;
  let id = request.params.id;
  let SQL = 'UPDATE click_counts SET name=$1 WHERE id=$2;';
  let values = [name, id];
  client.query(SQL, values)
    .then(() => {
      response.redirect('/');
    })
    .catch(errorHandler);
}

// For each individual in the list of results, see if they
// had a database entry and get the number of likes.
// Add a .likes property to the character with that number if found


function getNumberOfLikes(data) {
  let names = data.results.map(person => person.name);
  let SQL = "SELECT * FROM click_counts WHERE remote_id = ANY($1)";
  return database.query(SQL, [names])
    .then(counts => {
      for (let i = 0; i < data.results.length; i++) {
        for (let x = 0; x < counts.rows.length; x++) {
          if (data.results[i].name === counts.rows[x].remote_id) {
            data.results[i].likes = counts.rows[x].clicks;
          }
        }
      }
      return data;
    })
}


function errorHandler(error, response) {
  response.render('views/error.ejs', { error: 'These are not the droids you were looking for.' });
}

module.exports = { homePageHandler };
