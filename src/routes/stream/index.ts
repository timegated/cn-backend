import express from 'express';
import { promptResponseChat, promptResponseStream, promptResponseStreamChat } from '../../openai';
import fs from 'fs';
import path from 'path';

export const router = express.Router();


router.get(
  "/",
  async (req: express.Request, res: express.Response, next) => {
    res.set({
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
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
      const result = await promptResponseStream(promptText, model, maximumTokens);
      for await (const comp of result) {
        res.write(`data: ${comp.choices[0].text.replace(/^data: /g, '').replace(/\n/g, '').replace(/\"/, '')}\n\n`);
      }
      res.write("event: done\ndata: \n\n");
      res.on("close", () => {
        result.controller.abort();
      })
    } catch (error) {
      // Logging at some point
      res.status(500).send("Internal Server Error");
      throw error;
    }
  }
);


router.get('/chat', async (req: express.Request, res: express.Response) => {
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
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
    const result = await promptResponseStreamChat([{ role: 'user', content: promptText }], model, maximumTokens);
    for await (const comp of result) {
      const { choices } = comp;
      const text = (choices[0].delta.content ? choices[0].delta.content : "").replace(/^data: /g, '').replace(/\n/g, '').replace(/\"/, '')
      res.write(`data: ${text}\n\n`);
    }
    res.write("event: done\ndata: \n\n");
    res.on("close", () => {
      result.controller.abort();
    })
  } catch (error) {
    res.status(400).send("Bad Request");
    throw error;
  }
})

router.get('/create-prompts', async (req, res) => {
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });
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
    ] as { role: string, content: string }[]
    const result = await promptResponseChat(message, model, maximumTokens, num, temp, as)
    if (result) {
      for await (const comp of result) {
        const { choices } = comp;
        const text = (choices[0].delta.content ? choices[0].delta.content : "").replace(/^data: /g, '').replace(/\n/g, '').replace(/\"/, '')
        res.write(`data: ${text}\n\n`);
      }
      res.write("event: done\ndata: \n\n");
      res.on("close", () => {
        result.controller.abort();
      })
    }
  } catch (error) {
    res.status(400).send('Bad Request');
    throw error;
  }
});

router.get('/sequence', async (req: express.Request, res: express.Response) => {
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
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

    return fs.readFile(filePath, 'utf8', async (err, data) => {
      if (err) {
        console.error(`Error reading file: ${err}`);
        return;
      }

      const strings = data.split('\n\n');
      const messages = [] as any[]
      for (let text of strings) {
        messages.push({ role: 'assistant', content: text });
      }
      const result = await promptResponseChat(messages[0], model, maximumTokens, num, temp, as)
      if (result) {
        for await (const comp of result) {
          if (comp.choices[0].delta.content) {
            res.write(comp.choices[0].delta.content.replace(/^data: /g, '').replace(/\n/g, '').replace(/\"/, ''));
          }
        }
        res.on("close", async () => {
          result.controller.abort();
          const responseSec = await promptResponseChat(messages[1], model, maximumTokens, num, temp, as);
          if (responseSec) {
            for await (const comp of responseSec) {
              if (comp.choices[0].delta.content) {
                res.write(comp.choices[0].delta.content.replace(/^data: /g, '').replace(/\n/g, '').replace(/\"/, ''));
              }
            }
            res.on("close", () => {
              responseSec.controller.abort();
            })
          }
        });

      }
    });
  });
});
