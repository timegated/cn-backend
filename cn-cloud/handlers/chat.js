import chatgpt from "../singleton/openai-instance";

const chat = () => {
    return chatgpt.listModels().then((result) => {
      console.log("list of models successfully retrieved")
      return result.data;
    })
    .catch((error) => {
      console.error('Something went wrong with this request');
      throw error;
    });
};


module.exports = chat;