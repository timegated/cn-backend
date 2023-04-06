import express from 'express';
import { promptResponse, promptResponseChat, promptResponseStream, promptResponseStreamChat } from '../../openai';
import { streamOn } from '../../utils';
import { Readable, Writable } from "stream";
import fs from 'fs';
import path from 'path';

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
      const result = await promptResponseStream(promptText, model, maximumTokens);
      const stream = streamOn(result, false);
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
    const result = await promptResponseStreamChat(promptText, model, maximumTokens);
    const stream = streamOn(result, true);
    stream.pipe(res);
  } catch (error) {
    res.status(400).send("Bad Request");
    throw error;
  }
})

router.get('/sequence', async (req: express.Request, res: express.Response) => {
  res.set({
    'Cache-Control': 'no-cache',
    'Content-Type': 'application/json',
    'Transfer-Encoding': 'chunked'
  });

  const { prompt, modelChoice, maxTokens, numResponses, temperature, responseAs } = req.query;
  const model = modelChoice ? String(modelChoice) : "gpt-3.5-turbo";
  const maximumTokens = maxTokens ? Number(maxTokens) : 1000;
  const num = numResponses ? Number(numResponses) : 1;
  const temp = temperature ? Number(temperature) : 0.1;
  const as = responseAs ? String(responseAs) : 'json';

  const writable = new Writable({
    write(chunk, encoding, next) {
      res.write(chunk);
      next();
    }
  });

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
      for (let text of strings) {
        const result = await promptResponseChat(text, model, maximumTokens, num, temp, as);
        const readable = streamOn(result?.data, true);
        readable.pipe(writable, { end: false });
      }
    
      writable.on('finish', () => {
        res.end();
      });
    });
  });
});
