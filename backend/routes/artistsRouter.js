/* eslint-disable no-param-reassign */
const express = require('express');
const ResponseHandler = require('./responseHandler');
const ArtistsController = require('../routeControllers/artistsController');

function routes(artistsController) {
  const artistsRouter = express.Router();
  const controller = artistsController;

  artistsRouter.route('/artists/:artistId/albums')
    .get(ArtistsController.validateArtistId,
      controller.getAlbumsByArtistId,
      ResponseHandler.successfullyRespondWithData)
    .all(ResponseHandler.sendMethodNotAllowed);

  artistsRouter.route('/artists')
    .get(ArtistsController.parseSearchTextParameter,
      controller.getArtistsWithSearchText,
      ResponseHandler.successfullyRespondWithData)
    .all(ResponseHandler.sendMethodNotAllowed);

  artistsRouter.route('/*').all(ResponseHandler.sendNotFound);
  artistsRouter.use(ResponseHandler.handleErrorsAndRespond);

  return artistsRouter;
}

module.exports = routes;
