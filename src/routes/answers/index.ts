import * as express from 'express';
import { promptResponse } from '../../openai';

export const router = express.Router();

router.get("/", async (req: express.Request, res: express.Response) => {
  try {
    const { prompt, modelChoice, maxTokens, numResponses, temperature, responseAs } = req.query;
    const promptText = prompt ? String(prompt) : "";
    const model = modelChoice ? String(modelChoice) : "gpt-03-turbo";
    const maximumTokens = maxTokens ? Number(maxTokens) : 1000;
    const num = numResponses ? Number(numResponses) : 1;
    const temp = temperature ? Number(temperature) : 0.1;
    const as = responseAs ? String(responseAs) : 'json';
    if (!prompt && !maxTokens) {
      res.status(400).send("Prompt and maxTokens are required for request");
      return;
    }
    if (promptText.length + maximumTokens > 4096) {
      res.status(400).send("Max Tokens cannot exceed 4096")
    }
    const result = await promptResponse(promptText, model, maximumTokens, num, temp, as);
    if (result) {
      for await (const comp of result) {
          res.write(comp.choices[0].text.replace(/^data: /g, '').replace(/\n/g, '').replace(/\"/, ''));
      }
      res.on("close", () => {
        result.controller.abort();
      });
    } else {
      res.status(500).send('Something went wrong');
      return;
    }
  } catch (error) {
    res.status(400).send("Bad Request");
    throw error;
  }
});

