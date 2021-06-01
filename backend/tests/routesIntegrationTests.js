const sinon = require('sinon');
// const { assert } = require('chai');
const axios = require('axios');
// const createError = require('http-errors');
const request = require('supertest');
const app = require('../app');

const agent = request.agent(app);
describe('Routes integration tests', () => {
  let sandBox;

  beforeEach(() => {
    sandBox = sinon.createSandbox();
  });
  afterEach((done) => {
    sandBox.restore();
    app.server.close(done());
  });

  it('should return 404 not found if route is not part of the router', async () => {
    // act
    await agent.post('/doesNotExist')
      .send()
      .expect(404); // assert
  });

  it('should return 405 if method not allowed in a route', async () => {
    // act
    await agent.post('/api/artists?searchText=test')
      .send()
      .expect(405); // assert

    await agent.post('/api/artists/12345/albums')
      .send()
      .expect(405); // assert
  });

  it('should return 400 when calling artists with invalid search text', async () => {
    // act
    await agent.get('/api/artists?searchText=')
      .send()
      .expect(400); // assert
  });

  it('should return 400 when calling albums with invalid artist id', async () => {
    // act
    await agent.get('/api/artists/-1/albums')
      .send()
      .expect(400); // assert
  });

  it('should return 500 when an error happens in the artists request', async () => {
    // arrange
    sandBox.stub(axios, 'get').callsFake(async () => (Promise.reject(new Error('test error'))));
    // act
    await agent.get('/api/artists?searchText=1234')
      .send()
      .expect(500); // assert
  });

  it('should return 500 when an error happens in the albums request', async () => {
    // arrange
    sandBox.stub(axios, 'get').callsFake(async () => (Promise.reject(new Error('test error'))));
    // act
    await agent.get('/api/artists/123451/albums')
      .send()
      .expect(500); // assert
  });

  it('should return 500 when an error happens in the artists request', async () => {
    // arrange
    sandBox.stub(axios, 'get').callsFake(async () => (Promise.resolve(new Error('test error'))));
    // act
    await agent.get('/api/artists?searchText=1234')
      .send()
      .expect(500); // assert
  });

  it('should return 500 if itunes search responses successfully with unknown data', async () => {
    // arrange
    sandBox.stub(axios, 'get').callsFake(async () => (Promise.resolve({ data: { test: 1234 } })));
    // act
    await agent.get('/api/artists?searchText=1234')
      .send()
      .expect(500); // assert
  });

  it('should return 200 if itunes lookup responses with correct data', async () => {
    // arrange
    sandBox.stub(axios, 'get').callsFake(async () => (Promise.resolve({ data: { results: [] } })));
    // act
    await agent.get('/api/artists/123451/albums')
      .send()
      .expect(200); // assert
  });

  it('should return 200 if itunes artists endpoint responses with correct data', async () => {
    // arrange
    sandBox.stub(axios, 'get').callsFake(async () => (Promise.resolve({ data: { results: [] } })));
    // act
    await agent.get('/api/artists?searchText=1234')
      .send()
      .expect(200); // assert
  });
});
