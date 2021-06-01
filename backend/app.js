const express = require('express');
const morgan = require('morgan');
// init dependencies
const HttpRequester = require('./dataControllers/httpRequester');
const ItunesService = require('./services/itunesService');
const ArtistsController = require('./routeControllers/artistsController');

const artistsController = new ArtistsController(
  new ItunesService(HttpRequester)
);

const app = express();
const port = process.env.PORT || 4000;

app.use(morgan('tiny'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const artistsRouter = require('./routes/artistsRouter')(artistsController);

app.use('/api', artistsRouter);

app.all('/*', (req, res) => {
  res.sendStatus(404);
});

app.server = app.listen(port, () => {
  console.log(`Running on port ${port}`);
});

module.exports = app;
