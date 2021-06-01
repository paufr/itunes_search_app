const sinon = require('sinon');
const { assert } = require('chai');
const axios = require('axios');
const createError = require('http-errors');
const HttpRequester = require('../dataControllers/httpRequester');

describe('HttpRequester getJsonAsync tests', () => {
  let sandBox;

  beforeEach(() => {
    sandBox = sinon.createSandbox();
  });
  afterEach(() => {
    sandBox.restore();
  });

  it('should return result data from the axio request if successful', async () => {
    // arrange
    sandBox.stub(axios, 'get').callsFake(async () => (Promise.resolve({ data: { test: 123 } })));

    // act
    const res = await HttpRequester.getJsonAsync();

    // assert
    assert.exists(res.data, 'response data should exist');
    assert.notExists(res.error, 'response error should not exist');
    assert.equal(res.data.test, 123, 'response data should be set according json resolved');
  });

  it('should return http error results from axio response if not successful', async () => {
    // arrange
    const error = {
      response: {
        status: 400,
        statusText: 'Bad Request',
        data: {},
      }
    };
    sandBox.stub(axios, 'get').callsFake(async () => (Promise.reject(error)));

    // act
    const res = await HttpRequester.getJsonAsync();

    // assert
    assert.notExists(res.data, 'response data should not exist');
    assert.exists(res.error, 'response error should exist');
    assert.isTrue(createError.isHttpError(res.error), 'the error returned should be http error');
    assert.equal(res.error.status, error.response.status, 'the error code should be set according to the response received');
    assert.equal(res.error.message, error.response.statusText, 'the error message should be set according to the response received');
    assert.exists(res.error.details, 'the error returned should include details if any');
  });

  it('should return internal server error result from axio response if non-http related error occurs', async () => {
    // arrange
    const error = new Error('another error');
    sandBox.stub(axios, 'get').callsFake(async () => (Promise.reject(error)));

    // act
    const res = await HttpRequester.getJsonAsync();

    // assert
    assert.notExists(res.data, 'response data should not exist');
    assert.exists(res.error, 'response error should exist');
    assert.isTrue(createError.isHttpError(res.error), 'it should finally return an http error');
    assert.equal(res.error.status, 500, 'the error code should be set to 500');
    assert.equal(res.error.message, 'Internal Server Error', 'the error message should be set to Internal Server Error');
    assert.equal(res.error.details, error, 'the error returned should include the original error as a detail');
  });
});
