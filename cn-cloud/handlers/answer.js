const { Configuration, OpenAIApi } = require('openai');
const config = new Configuration({
  apiKey: process.env.GPT_SECRET,
});

const chatgpt = new OpenAIApi(config);

function getAnswer() {
  return chatgpt.createCompletion(
    {
      model: "text-davinci-003",
      prompt: "Write a prompt to query a dom node",
      temperature: 0,
      n: 1,
    }
  ).then(result => {
    console.log('Result from chatgpt succesful');
    console.log(result.data.choices[0]);
    return result.data.choices[0].text.replace('\n\n', '');
  }).catch((error) => {
    console.error('Error requesting answer');
    throw error
  });
}

module.exports = getAnswer;
