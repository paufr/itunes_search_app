const sinon = require('sinon');
const { assert } = require('chai');
const createError = require('http-errors');
const ResponseHandler = require('../routes/responseHandler');

describe('ResponseHandler tests', () => {
  describe('handleErrorsAndRespond tests', () => {
    it('should respond with correct status and message when http error is passed', async () => {
      // arrange
      const error = new createError.InternalServerError();
      const res = {
        status: sinon.spy(),
        json: sinon.spy()
      };

      // act
      ResponseHandler.handleErrorsAndRespond(error, {}, res, {});

      // assert
      assert.equal(res.status.firstCall.args[0], error.status, 'should respond the same status code than the http error');
      assert.equal(res.json.firstCall.args[0].code, error.status, 'json should have the same code than the http error');
      assert.equal(res.json.firstCall.args[0].message, error.message, 'json should have the same message than the http error');
      assert.hasAllKeys(res.json.firstCall.args[0], ['code', 'message'], 'json should only have code and message values');
    });

    it('should respond with Internal Server Error if non-http error is passed', async () => {
      // arrange
      const error = new Error('this is an expected test error that could be logged, not an issue!');
      const res = {
        status: sinon.spy(),
        json: sinon.spy()
      };

      // act
      ResponseHandler.handleErrorsAndRespond(error, {}, res, {});

      // assert
      assert.equal(res.status.firstCall.args[0], 500, 'should respond with 500 status code');
      assert.equal(res.json.firstCall.args[0].code, 500, 'json should have 500 code');
      assert.equal(res.json.firstCall.args[0].message, 'Internal Server Error', 'json should have Internal Server Error message');
      assert.hasAllKeys(res.json.firstCall.args[0], ['code', 'message'], 'json should only have code and message values');
    });

    it('should respond with Internal Server Error if unknown error type is passed', async () => {
      // arrange
      const error = 'this is a test message that could be logged, not an issue!';
      const res = {
        status: sinon.spy(),
        json: sinon.spy()
      };

      // act
      ResponseHandler.handleErrorsAndRespond(error, {}, res, {});

      // assert
      assert.equal(res.status.firstCall.args[0], 500, 'should respond with 500 status code');
      assert.equal(res.json.firstCall.args[0].code, 500, 'json should have 500 code');
      assert.equal(res.json.firstCall.args[0].message, 'Internal Server Error', 'json should have Internal Server Error message');
      assert.hasAllKeys(res.json.firstCall.args[0], ['code', 'message'], 'json should only have code and message values');
    });
  });
  it('should respond with appropriate status and message when sendMethodNotAllowed is called', async () => {
    // arrange
    const res = {
      status: sinon.spy(),
      json: sinon.spy()
    };

    // act
    ResponseHandler.sendMethodNotAllowed({}, res);

    // assert
    assert.equal(res.status.firstCall.args[0], 405, 'should respond with 405 status code');
    assert.equal(res.json.firstCall.args[0].code, 405, 'json should have 405 code');
    assert.equal(res.json.firstCall.args[0].message, 'Method Not Allowed', 'json should have Method Not Allowed message');
    assert.hasAllKeys(res.json.firstCall.args[0], ['code', 'message'], 'json should only have code and message values');
  });
  it('should respond with appropriate status and message when sendNotFound is called', async () => {
    // arrange
    const res = {
      status: sinon.spy(),
      json: sinon.spy()
    };

    // act
    ResponseHandler.sendNotFound({}, res);

    // assert
    assert.equal(res.status.firstCall.args[0], 404, 'should respond with 404 status code');
    assert.equal(res.json.firstCall.args[0].code, 404, 'json should have 404 code');
    assert.equal(res.json.firstCall.args[0].message, 'Not Found', 'json should have Not Found message');
    assert.hasAllKeys(res.json.firstCall.args[0], ['code', 'message'], 'json should only have code and message values');
  });
  describe('successfullyRespondWithData tests', () => {
    it('should respond with sucessful status and content when content passed from res locals', async () => {
      // arrange
      const res = {
        locals: { data: 'test' },
        status: sinon.spy(),
        json: sinon.spy()
      };

      // act
      ResponseHandler.successfullyRespondWithData({}, res);

      // assert
      assert.equal(res.status.firstCall.args[0], 200, 'should respond with 200 status code');
      assert.deepEqual(res.json.firstCall.args[0], res.locals.data, 'json should respond with content');
    });
    it('should respond with sucessful status and empty content when content is not passed or cannot be obtained', async () => {
      // arrange
      const res = {
        status: sinon.spy(),
        json: sinon.spy()
      };

      // act
      ResponseHandler.successfullyRespondWithData({}, res);

      // assert
      assert.equal(res.status.firstCall.args[0], 200, 'should respond with 200 status code');
      assert.deepEqual(res.json.firstCall.args[0], {}, 'json should respond with empty');
    });
  });
});
