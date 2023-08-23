import express from 'express';
import { promptResponseChat, promptResponseStream, promptResponseStreamChat } from '../../openai';
import { streamOn } from '../../utils';
import fs from 'fs';
import path from 'path';
import { ChatCompletionRequestMessage } from 'openai';

export const router = express.Router();


router.get(
  "/",
  async (req: express.Request, res: express.Response, next) => {
    res.set({
      'Content-Type': 'text/stream',
      'Transfer-Encoding': 'chunked'
    });
    try {
      const { prompt, modelChoice, maxTokens } = req.query;
      const promptText = prompt ? String(prompt) : "";
      const model = modelChoice ? String(modelChoice) : "text-davinci-003";
      const maximumTokens = maxTokens ? Number(maxTokens) : 1000;
      if (!prompt && !maxTokens && Number(maxTokens) > 4096) {
        res.status(400).send("Prompt is required for request");
        return;
      }
      if (promptText.length + maximumTokens > 4096) {
        res.status(400).send("Max Tokens cannot exceed 4096")
      }
      const result = await promptResponseStreamChat([{role: "user", content: promptText}], model, maximumTokens);
      const stream = streamOn(result, true);
      stream.pipe(res);
    } catch (error) {
      // Logging at some point
      res.status(400).send("Bad Request");
      throw error;
    }
  }
);


router.get('/chat', async (req: express.Request, res: express.Response) => {
  res.set({
    'Content-Type': 'text/stream',
    'Transfer-Encoding': 'chunked'
  });
  try {
    const { prompt, modelChoice, maxTokens } = req.query;
    const promptText = prompt ? String(prompt) : "";
    const model = modelChoice ? String(modelChoice) : "gpt-3.5-turbo";
    const maximumTokens = maxTokens ? Number(maxTokens) : 1000;
    if (!prompt && !maxTokens && Number(maxTokens) > 4096) {
      res.status(400).send("Prompt is required for request");
      return;
    }
    if (promptText.length + maximumTokens > 4096) {
      res.status(400).send("Max Tokens cannot exceed 4096")
    }
    const result = await promptResponseStreamChat([{role: 'user', content: promptText}], model, maximumTokens);
    const stream = streamOn(result, true);
    stream.pipe(res);
  } catch (error) {
    res.status(400).send("Bad Request");
    throw error;
  }
})

router.get('/create-prompts', async (req, res) => {
  try {
    const { topic, modelChoice, maxTokens, numResponses, temperature, responseAs } = req.query;
    const model = modelChoice ? String(modelChoice) : "gpt-3.5-turbo";
    const maximumTokens = maxTokens ? Number(maxTokens) : 1000;
    const num = numResponses ? Number(numResponses) : 1;
    const temp = temperature ? Number(temperature) : 0.1;
    const as = responseAs ? String(responseAs) : 'json';
    const promptGenerator = `Generate exactly 10 sentences that start with any of the following list of words: create, rewrite, generate, suggest, design, construct, make, identify, calculate, convert, find, name, provide, 
    summarize, classify, describe, edit, give, explain, and write. These questions must also contain the following list of words associated with each respectively in order: 
    list, poem, sentence, story. phrase, paragraph, statement, sentence. question, story, sentence, list. title, strategy, idea, way. experiment, game, algorithm, logo. timeline, argument, query, sentence. prediction list. 
    difference, theme, subject type. average, cost, sum. temperature text, sentence, number. synonym, number, area, word. element, benefit, country type. summary, solution, list, example. paragraph example. point, text, 
    article. word, animal item. benefit, impact difference, process. text, sentence. description, example. meaning, difference. description, function sentence, story.
    The sentences must start with create, rewrite, generate, suggest, design, construct, make, identify, calculate, convert, find, name, provide, summarize, classify, describe, edit, give, explain, and write.
    Get the sentences to pertain to the topic ${topic} and return as a list always. The list is unordered. I want only the text. I do not want the list ordered or labelled in any way.`
    const message = [
      {
        role: 'user',
        content: 'you are a very brief with your responses and cut straight to the value of the information you want to provide, time is of the essence',
      },
      {
        role: 'user',
        content: promptGenerator
      },
      {
        role: 'user',
        content: 'you will always return the response back as a list using a dash'
      },
      {
        role: 'user',
        content: 'the list will always contain exactly 10 items'
      },
      {
        role: 'user',
        content: 'the list will always be returned as markdown'
      },
      {
        role: 'assistant',
        content: 'you will never apologize for being an AI'
      },
    ] as ChatCompletionRequestMessage[]
    const responseFirst = await promptResponseChat(message, model, maximumTokens, num, temp, as)
    const readableFirst = streamOn(responseFirst, true);
    readableFirst.pipe(res, { end: false });
    
    readableFirst.on('end', () => {
      console.log('response complete')
    }) 

  } catch (error) {
    res.status(400).send('Bad Request');
    throw error;
  }
});

router.get('/sequence', async (req: express.Request, res: express.Response) => {
  res.set({
    'Cache-Control': 'no-cache',
    'Content-Type': 'application/json',
    'Text-Encoding': 'chunk'
  });

  const { prompt, modelChoice, maxTokens, numResponses, temperature, responseAs } = req.query;
  const model = modelChoice ? String(modelChoice) : "gpt-3.5-turbo";
  const maximumTokens = maxTokens ? Number(maxTokens) : 1000;
  const num = numResponses ? Number(numResponses) : 1;
  const temp = temperature ? Number(temperature) : 0.1;
  const as = responseAs ? String(responseAs) : 'json';

const filePath = path.join(__dirname, 'topic-prompts.txt');

fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      console.error(`Error reading file: ${err}`);
      return;
    }
  
    return fs.readFile(filePath, 'utf8', async(err, data) => {
      if (err) {
        console.error(`Error reading file: ${err}`);
        return;
      }
  
      const strings = data.split('\n\n');
      const messages = [] as ChatCompletionRequestMessage[]
      for (let text of strings) {
        messages.push({role: 'assistant', content: text});
      }
      const responseFirst = await promptResponseChat(messages[0], model, maximumTokens, num, temp, as)
      const readableFirst = streamOn(responseFirst, true);
      console.log(readableFirst);
      readableFirst.pipe(res, { end: false });
      
      readableFirst.on('end', async (data: string) => {
        const responseSec = await promptResponseChat(messages[1], model, maximumTokens, num, temp, as);
        const readableSecond = streamOn(responseSec, true);
        readableSecond.pipe(res, {end: true});
      })
    });
  });
});
