const express = require('express');
const morgan = require('morgan');
const history = require('connect-history-api-fallback');

const HttpRequester = require('./dataControllers/httpRequester');
const ItunesService = require('./services/itunesService');
const ArtistsController = require('./routeControllers/artistsController');

const artistsController = new ArtistsController(
  new ItunesService(HttpRequester)
);

const app = express();
const port = process.env.PORT || 8080;

app.use(morgan('tiny'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const artistsRouter = require('./routes/artistsRouter')(artistsController);

app.use('/api', artistsRouter);

app.use(history());
app.use('/', express.static('../frontend/dist', {index: 'index.html' }));

app.server = app.listen(port, () => {
  console.log(`Running on port ${port}`);
});

module.exports = app;
