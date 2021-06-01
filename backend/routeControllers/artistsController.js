const createError = require('http-errors');

function addArtistLinks(host, artists) {
  artists.forEach((artist) => {
    // eslint-disable-next-line no-param-reassign
    artist.links = { albumList: `http://${host}/api/artists/${artist.id}/albums` };
  });
}

class ArtistsController {
  constructor(itunesService) {
    this.itunesService = itunesService;
    this.getArtistsWithSearchText = this.getArtistsWithSearchText.bind(this);
    this.getAlbumsByArtistId = this.getAlbumsByArtistId.bind(this);
  }

  static parseSearchTextParameter(req, res, next) {
    if (req.query.searchText) {
      req.locals = {
        searchText: req.query.searchText.trim(),
      };
    }
    if (!req.locals?.searchText) {
      next(new createError.BadRequest('Search text not defined'));
    } else next();
  }

  async getArtistsWithSearchText(req, res, next) {
    try {
      const artists = await this.itunesService.getArtistsFromSearchText(req.locals.searchText);
      addArtistLinks(req.headers.host, artists);
      res.locals.data = artists;
      next();
    } catch (error) {
      next(createError(500, error));
    }
  }

  static validateArtistId(req, res, next) {
    const id = req.params?.artistId;
    if (id && Number.isInteger(Number(id)) && Number(id) >= 0) next();
    else next(new createError.BadRequest('Artist id value is not valid'));
  }

  async getAlbumsByArtistId(req, res, next) {
    try {
      res.locals.data = await this.itunesService.getAlbumsFromArtist(req.params.artistId);
      next();
    } catch (error) {
      next(createError(500, error));
    }
  }
}

module.exports = ArtistsController;
