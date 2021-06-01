/* eslint-disable import/no-extraneous-dependencies */
const sinon = require('sinon');
const { assert } = require('chai');
const { BadRequest } = require('http-errors');
const ArtistsController = require('../routeControllers/artistsController');
const ItunesService = require('../services/itunesService');
const Artist = require('../services/models/artist');
const Album = require('../services/models/album');

describe('Artists Controller Tests:', () => {
  describe('parseSearchTextParameter', () => {
    it('should not allow empty search text', () => {
      // arrange
      const req = {
        query: {
          searchText: ''
        },
        locals: {},
      };
      const res = {};
      const next = sinon.spy();
      // act
      ArtistsController.parseSearchTextParameter(req, res, next);

      // assert
      assert.notExists(req.locals.searchText, 'Search text data should not be assigned to req locals');
      assert.isTrue(next.calledOnce, 'next should be called once');
      assert.isNotEmpty(next.lastCall.args, 'Next should be called with an error');
      assert.instanceOf(next.lastCall.args[0], BadRequest, 'next should be called with a BadRequest');
    });

    it('should not allow unset search text parameter', () => {
      // arrange
      const req = {
        query: {},
        locals: {},
      };
      const res = {};
      const next = sinon.spy();

      // act
      ArtistsController.parseSearchTextParameter(req, res, next);

      // assert
      assert.notExists(req.locals.searchText, 'Search text data should not be assigned to req locals');
      assert.isTrue(next.calledOnce, 'next should be called once');
      assert.isNotEmpty(next.lastCall.args, 'next should be called with an error');
      assert.instanceOf(next.lastCall.args[0], BadRequest, 'next should be called with a BadRequest');
    });

    it('should parse search text if query parameter specified with text', () => {
      // arrange
      const req = {
        query: { searchText: 'Jack' },
        locals: {},
      };
      const res = {};
      const next = sinon.spy();

      // act
      ArtistsController.parseSearchTextParameter(req, res, next);

      // assert
      assert.exists(req.locals.searchText, 'Search text data should be assigned to req locals');
      assert.isTrue(next.calledOnce, 'next should be called once');
      assert.isEmpty(next.lastCall.args, 'next should be called without errors');
    });
  });
  describe('getArtistsFromSearchText', () => {
    it('should set res locals with data if itunes service gets results successfully', async () => {
      // arrange
      const req = {
        headers: { host: 'https://test.tst' },
        locals: { searchText: 'Jack' },
      };
      const res = { locals: {} };
      const next = sinon.spy();

      const itunesService = new ItunesService();
      sinon.stub(itunesService, 'getArtistsFromSearchText').callsFake(async () => []);
      const controller = new ArtistsController(itunesService);

      // act
      await controller.getArtistsWithSearchText(req, res, next);

      // assert
      assert.exists(res.locals.data, 'res.locals.data should exist');
      assert.deepEqual(res.locals.data, [], 'Results should be set to res.locals.data');
      assert.isTrue(next.calledOnce, 'next should be called once');
      assert.isEmpty(next.lastCall.args, 'next should be called with no errors');
    });

    it('should pass an error and should not set any response data if itunes service throws an exception', async () => {
      // arrange
      const req = {
        headers: { host: 'https://test.tst' },
        locals: { searchText: 'Jack' },
      };
      const res = { locals: {} };
      const next = sinon.spy();
      const error = new Error('message');

      const itunesService = new ItunesService();
      sinon.stub(itunesService, 'getArtistsFromSearchText').callsFake(async () => { throw error; });
      const controller = new ArtistsController(itunesService);

      // act
      await controller.getArtistsWithSearchText(req, res, next);

      // assert
      assert.notExists(res.locals.data, 'res.locals.data should not exist');
      assert.isTrue(next.calledOnce, 'next should be called once');
      assert.isNotEmpty(next.lastCall.args, 'next should be called with arguments');
      assert.instanceOf(next.lastCall.args[0], Error, 'next should be called with an error');
    });

    it('should return artists with links to albums if itunes service obtains results', async () => {
      // arrange
      const req = {
        headers: { host: 'https://test.tst' },
        locals: { searchText: 'Jack' },
      };
      const res = { locals: {} };
      const next = sinon.spy();

      const itunesService = new ItunesService();
      const itunesSpy = sinon.stub(itunesService, 'getArtistsFromSearchText')
        .callsFake(async () => [new Artist('Name', 123456, 'genre')]);
      const controller = new ArtistsController(itunesService);

      // act
      await controller.getArtistsWithSearchText(req, res, next);

      // assert
      assert.exists(res.locals.data, 'res.locals.data should exist');
      assert.isNotEmpty(res.locals.data, 'Results should be set to res.locals.data');
      assert.isTrue(next.calledOnce, 'next should be called once');
      assert.isTrue(itunesSpy.calledOnce, 'itunes service should be called once');
      assert.isEmpty(next.lastCall.args, 'next should be called with no errors');
      const artistReturned = res.locals.data[0];
      assert.exists(artistReturned.id, 'artist should have an id parameter');
      assert.exists(artistReturned.name, 'artist should have a name parameter');
      assert.exists(artistReturned.genre, 'artist should have a genre parameter');
      assert.exists(artistReturned.links.albumList, 'artist should have an album list link');
      assert.include(artistReturned.links.albumList, artistReturned.id, 'albums link should include artist id');
    });
  });

  describe('validateArtistId', () => {
    it('should not allow a non-integer id', () => {
      // arrange
      const req = {
        params: {
          artistId: 'id'
        },
        locals: {},
      };
      const res = {};
      const next = sinon.spy();

      // act
      ArtistsController.validateArtistId(req, res, next);

      // assert
      assert.isTrue(next.calledOnce, 'next should be called once');
      assert.isNotEmpty(next.lastCall.args, 'next should be called with an error');
      assert.instanceOf(next.lastCall.args[0], BadRequest, 'next should be called with a BadRequest');
    });

    it('should not allow an empty id', () => {
      // arrange
      const req = {
        params: {
          artistId: ''
        },
        locals: {},
      };
      const res = {};
      const next = sinon.spy();

      // act
      ArtistsController.validateArtistId(req, res, next);

      // assert
      assert.isTrue(next.calledOnce, 'next should be called once');
      assert.isNotEmpty(next.lastCall.args, 'next should be called with an error');
      assert.instanceOf(next.lastCall.args[0], BadRequest, 'next should be called with BadRequest');
    });

    it('should not allow a negative integer id', () => {
      // arrange
      const req = {
        params: {
          artistId: '-1'
        },
        locals: {},
      };
      const res = {};
      const next = sinon.spy();

      // act
      ArtistsController.validateArtistId(req, res, next);

      // assert
      assert.isTrue(next.calledOnce, 'next should be called once');
      assert.isNotEmpty(next.lastCall.args, 'next should be called with an error');
      assert.instanceOf(next.lastCall.args[0], BadRequest, 'next should be called with BadRequest');
    });

    it('should successfully validate id if it is a positive integer', () => {
      // arrange
      const req = {
        params: {
          artistId: '1'
        },
        locals: {},
      };
      const res = {};
      const next = sinon.spy();

      // act
      ArtistsController.validateArtistId(req, res, next);

      // assert
      assert.isTrue(next.calledOnce, 'next should be called once');
      assert.isEmpty(next.lastCall.args, 'next should not be called with an error');
    });
  });
  describe('getAlbumsByArtistId', () => {
    it('should pass an error if error thrown when getting albums', async () => {
      // arrange
      const req = {
        params: {
          artistId: '1'
        }
      };
      const res = { locals: {} };
      const next = sinon.spy();
      const error = new Error('message');

      const itunesService = new ItunesService();
      sinon.stub(itunesService, 'getAlbumsFromArtist')
        .callsFake(async () => { throw error; });
      const controller = new ArtistsController(itunesService);

      // act
      await controller.getAlbumsByArtistId(req, res, next);

      // assert
      assert.notExists(res.locals.data, 'res.locals.data should not exist');
      assert.isTrue(next.calledOnce, 'next should be called once');
      assert.isNotEmpty(next.lastCall.args, 'next should be called with arguments');
      assert.instanceOf(next.lastCall.args[0], Error, 'next should be called with an error');
    });

    it('should return an array of albums and the artist of the albums if the request was successful', async () => {
      // arrange
      const req = {
        params: {
          artistId: '1'
        }
      };
      const res = { locals: {} };
      const next = sinon.spy();

      const itunesService = new ItunesService();
      const sampleAlbum = new Album('collectionName', 12345, 'artist', 123234, 'https://thumbnail.com/img.jpg', 'genre', 'UK');
      const sampleArtist = new Artist('artist', 123234, 'genre');

      const stubServiceFunc = sinon.stub(itunesService, 'getAlbumsFromArtist')
        .callsFake(async () => ({ artist: sampleArtist, albums: [sampleAlbum] }));
      const controller = new ArtistsController(itunesService);

      // act
      await controller.getAlbumsByArtistId(req, res, next);

      // assert
      assert.isTrue(next.calledOnce, 'next should be called once');
      assert.isTrue(stubServiceFunc.calledOnce, 'getAlbumsFromArtist should be called once');
      assert.isEmpty(next.lastCall.args, 'next should be called with no errors');
      assert.exists(res.locals.data, 'res.locals.data should exist');
      assert.isNotEmpty(res.locals.data, 'Results should be set to res.locals.data');

      const artistReturned = res.locals.data.artist;
      assert.deepEqual(artistReturned, sampleArtist, 'artist should have the values obtained from the service');

      const albumReturned = res.locals.data.albums[0];
      assert.deepEqual(albumReturned, sampleAlbum, 'artist should have the values obtained from the service');
    });
  });
});
