import * as express from 'express';
import { promptResponse, promptResponseMultiple } from '../../openai';
import { api } from '../../openai';

export const router = express.Router();


router.get("/", async (req: express.Request, res: express.Response) => {
  try {
    const { prompt, modelChoice, maxTokens } = req.query;
    const promptText = prompt ? String(prompt) : "";
    const model = modelChoice ? String(modelChoice) : "text-davinci-003";
    const maximumTokens = maxTokens ? Number(maxTokens) : 1000;
    if (!prompt && !maxTokens) {
      res.status(400).send("Prompt and maxTokens are required for request");
      return;
    }
    if (promptText.length + maximumTokens > 4096) {
      res.status(400).send("Max Tokens cannot exceed 4096")
    }
    const result = await promptResponse(promptText, model, maximumTokens);

    res.status(200).send(result);
  } catch (error) {
    res.status(400).send("Bad Request");
    throw error;
  }
});

router.get("/multiple", async (req: express.Request, res: express.Response) => {
  try {
    const { prompt, modelChoice, maxTokens } = req.query;
    const promptText = prompt ? String(prompt) : "";
    const model = modelChoice ? String(modelChoice) : "text-davinci-003";
    const maximumTokens = maxTokens ? Number(maxTokens) : 1000;
    if (!prompt && !maxTokens) {
      res.status(400).send("Prompt and maxTokens are required for request");
      return;
    }
    if (promptText.length + maximumTokens > 4096) {
      res.status(400).send("Max Tokens cannot exceed 4096")
    }
    const result = await promptResponseMultiple(promptText, model, maximumTokens);

    res.status(200).json(result);
  } catch (error) {
    res.status(400).send("Bad Request");
    throw error;
  }
});



router.get("/completion", async (req: express.Request, res: express.Response) => {
  try {
    const tokenLimit = 4097

    const prompt = req.query.prompt ? String(req.query.prompt) : '';
    const selectKey = req.query.selectKey ? String(req.query.selectKey) : 'class';

    const classSelector = (promptText: string) => `that grabs textContent from any class with name ${promptText}`;
    const idSelector = (promptText: string) => `that grabs textContent form any id with name ${promptText}`;
    const attrSelector = (promptText: string) => `that grabs textContent from any attribute with name ${promptText}`;


    const callMap = new Map([['id', idSelector], ['class', classSelector], ['attr', attrSelector]]);

    const callFunctionFor = (key: string) => {
      const funcCall = callMap.get(key);

      if (funcCall) {
        return funcCall(prompt);
      }

      return classSelector(prompt);
    };
  
    const template = () => {
      return `You an experienced Javascript developer with experience using Jquery.
      Selector ${callFunctionFor(selectKey)}`
    };

    const maxTokens = Math.round(tokenLimit - template().length / 2.5);

    const generateJqSelector = await api.createCompletion({
      model: 'text-davinci-003',
      prompt: template(),
      n: 1,
      temperature: 0,
      max_tokens: maxTokens,
      suffix: 'using the JQuery Library without comments'
    });

    res.status(200).send(generateJqSelector.data.choices[0].text?.replace(/\/\/(.+)/, ''));
  } catch (error: any) {
    if (error.response) {
      console.log(error.response.status);
      console.log(error.response.data);
    } else {
      console.log(error.message);
    }
  }
})