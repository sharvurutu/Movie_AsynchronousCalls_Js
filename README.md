# Movie Cruiser Assignment - Level - 1

## Objective

The Objective of this assignment is to work with ReST API's , understand asynchronous programming and build interactive web pages using Javascript.

## Prerequisites

1. Fork this repository
2. Clone the repository and cd into it
3. Install json-server. The idea here is to use json-server to serve static pages and data for movies.

```
  sudo npm install -g json-server
  json-server -s public db.json
```

## Coding Guidelines

1. All your HTML code basically resides in public/index.HTML
2. All your JavaScript code resides in the public/js folder
3. Both the HTML and Javascript code should be well indented and commented
4. You can use Bootstrap to style your pages and elements
5. The Assignment should be pushed to gitlab on completion and all the mentors should be added.

## Assignment

1. Populate data for ***Movies*** collection in db.json.
2. Create Two Sections/List ***Movies*** and ***Favorites*** in your HTML page.
3. ***Movies*** and the ***Favorites*** section of the page should populate all the movies and favorites from the db.json using AJAX calls.
4. Every ***Movie*** item should have a ***Add to Favorites*** button.
5. On click of the ***Add to Favorites*** button the copy of the movie item should be moved to the ***Favorites*** list/section. The movie added to ***Favorites*** section should also be added to the db.json using AJAX calls.
