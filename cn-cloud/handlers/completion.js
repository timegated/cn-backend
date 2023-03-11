const { Configuration, OpenAIApi } = require('openai');
const config = new Configuration({
  apiKey: process.env.GPT_SECRET,
});

const chatgpt = new OpenAIApi(config);

const completion = () => {
  return chatgpt.createCompletion({
    model: 'code-cushman-001',
    prompt: 'Write a function that add two numbers in js',
  }).then((result) => {
    console.log(result.data.choices);
    return result.data.choices;
  })
  .catch((err) => {
    console.error(err);
    throw err;
  })
}

module.exports = completion;