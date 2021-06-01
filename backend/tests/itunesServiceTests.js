/* eslint-disable import/no-extraneous-dependencies */
const should = require('should');
const sinon = require('sinon');
const { assert } = require('chai');
const fs = require('fs');
const path = require('path');
const createError = require('http-errors');

const Artist = require('../services/models/artist');
const Album = require('../services/models/album');
const ItunesService = require('../services/itunesService');
const HttpRequester = require('../dataControllers/httpRequester');

describe('iTunes Service Tests:', () => {
  let sandBox;
  beforeEach(() => {
    sandBox = sinon.createSandbox();
  });
  describe('getArtistsFromSearchText', () => {
    it('should throw an error if the response is not successful', async () => {
      // arrange
      const requesterStub = sandBox.stub(HttpRequester, 'getJsonAsync')
        .callsFake(async () => ({
          data: undefined,
          error: new createError.InternalServerError('error message'),
        }));
      const service = new ItunesService(HttpRequester);

      // act
      let artistsMessage = '';
      try {
        await service.getArtistsFromSearchText('artist');
      } catch (e) {
        artistsMessage = e.message;
      }

      // assert
      assert.isTrue(requesterStub.calledOnce, 'Http requester should be called to obtain data');
      assert.equal(artistsMessage, 'error message', 'getArtistsFromSearchText should throw an Error');
    });
    it('should return artists list with values set according to the response received', async () => {
      // arrange
      const requesterStub = sandBox.stub(HttpRequester, 'getJsonAsync')
        .callsFake(async () => {
          const jpath = path.resolve(__dirname, './samples/artistsSearchResults.json');
          return {
            data: JSON.parse(fs.readFileSync(jpath, 'utf8'))
          };
        });
      const service = new ItunesService(HttpRequester);

      // act
      let results;
      let threwError = false;
      try {
        results = await service.getArtistsFromSearchText('text');
      } catch (e) {
        threwError = true;
      }

      // assert
      assert.isTrue(requesterStub.calledOnce, 'Http requester should be called to obtain data');
      assert.isFalse(threwError, 'no error should be thrown');
      should.equal(results.length, 16, 'The number of results returned does not match the number of artists from the response');
      results.forEach((value) => {
        assert.instanceOf(value, Artist, 'Results are not Artist instace');
        should.exists(value.name, 'name property does not exist');
        should.exists(value.id, 'id property does not exist');
      });
    });
  });
  describe('getAlbumsFromArtist', () => {
    it('should throw an error if the response is not successful', async () => {
      // arrange
      const requesterStub = sandBox.stub(HttpRequester, 'getJsonAsync')
        .callsFake(async () => ({
          data: undefined,
          error: new createError.InternalServerError('error message'),
        }));
      const service = new ItunesService(HttpRequester);

      // act
      let errorMessage = '';
      try {
        await service.getAlbumsFromArtist('artistId');
      } catch (e) {
        errorMessage = e.message;
      }

      // assert
      assert.isTrue(requesterStub.calledOnce, 'getJsonAsync should be called once');
      assert.equal(errorMessage, 'error message', 'getAlbumsFromArtist should throw an exception');
    });
    it('should return only (and not repeated) albums with values set according to the response received', async () => {
      // arrange
      const requesterStub = sandBox.stub(HttpRequester, 'getJsonAsync')
        .callsFake(async () => ({
          data: JSON.parse(fs.readFileSync(path.resolve(__dirname, './samples/albumsLookupResults.json'), 'utf8'))
        }));
      const service = new ItunesService(HttpRequester);

      let results;
      let threwError = false;
      try {
        results = await service.getAlbumsFromArtist('artist');
      } catch (e) {
        threwError = true;
      }

      // assert
      assert.isTrue(requesterStub.calledOnce, 'getJsonAsync should be called once');
      assert.isFalse(threwError, 'no error should be thrown');
      assert.exists(results.artist);
      assert.exists(results.artist.id);
      assert.exists(results.artist.name);
      assert.exists(results.artist.genre);
      // albums should not be repeated
      should.equal(results.albums.length, 35, 'The number of results returned does not match the number of albums from the response');
      results.albums.forEach((value) => {
        assert.instanceOf(value, Album, 'Results are not Artist instance');
        should.exists(value.collectionId, 'collectionId property does not exist');
        should.exists(value.collectionName, 'collectionName property does not exist');
        should.exists(value.thumbnail, 'thumbnail property does not exist');
        should.exists(value.artistId, 'artistId property does not exist');
        should.exists(value.country, 'country property does not exist');
        should.exists(value.genre, 'genre property does not exist');
        should.exists(value.releaseDate, 'releaseDate property does not exist');
      });
    });
  });
  afterEach(() => {
    sandBox.restore();
  });
});
