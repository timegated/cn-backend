const {OpenAIApi} = require('openai');

const config = new Configuration({
  apiKey: process.env.GPT_SECRET,
});
const chatgpt = new OpenAIApi(config);

module.exports = chatgpt;