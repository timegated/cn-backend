import express from 'express';
import { promptResponseStream } from '../../openai';
import { streamOn } from '../../utils';
import {finished} from 'stream';
export const router = express.Router();


router.get(
    "/",
    async (req: express.Request, res: express.Response, next) => {
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
        const stream = streamOn(result);
        stream.pipe(res, { end: false });
        finished(stream, (err) => {
          if (err) {
            next(err);
            return;
          }
          res.end();
        });
      } catch (error) {
        // Logging at some point
        res.status(400).send("Bad Request");
        throw error;
      }
    }
  );