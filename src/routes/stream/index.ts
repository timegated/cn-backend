import express from 'express';
import { promptResponseStream, promptResponseStreamChat } from '../../openai';
import { streamOn } from '../../utils';
export const router = express.Router();


router.get(
  "/",
  async (req: express.Request, res: express.Response, next) => {
    res.set({
      'Content-Type': 'text/plain',
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
    'Content-Type': 'text/plain',
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