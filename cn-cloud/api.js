const API = require('claudia-api-builder');
const api = new API();
const getAnswer = require('./handlers/answer');
const chat = require('./handlers/chat');
const completion = require('./handlers/completion');

api.get('/', () => {
  return 'Welcome to Chat Node on the Cloud';
});

api.get('/answer', () => {
  return getAnswer()
}, {
  success: 200,
  error: 404
});

api.get('/completion', async () => {
  return completion();
}, {
  success: 200,
  error: 404,
});

api.get('/chat', async (res) => {
  return chat();
}, {
  success: 200,
  error: 404
});

module.exports = api;