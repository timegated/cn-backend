import * as express from "express";
import { api } from '../../openai';
import * as fs from 'fs';
export const router = express.Router();

// Prompt Templates;
const classSelector = (promptText: string) => `that grabs text content from any class with name ${promptText}`;
const idSelector = (promptText: string) => `that grabs text content form any id with name ${promptText}`;
const attrSelector = (promptText: string) => `that grabs text content from any attribute with name ${promptText}`;
const nestedSelector = (promptText: string) => `that grabs any content that is nested inside a span with data ${promptText}`;
const elementSelector = (promptText: string) => `that grabs the text content of any html element with name ${promptText}`;
const imgSelector = () => `that selects image urls and returns the data as a string`;

const callMap = new Map([['id', idSelector], ['class', classSelector], ['attr', attrSelector], ['nested', nestedSelector], ['img', imgSelector], ['element', elementSelector]]);

const callFunctionFor = (key: string, prompt: string) => {
  const funcCall = callMap.get(key);

  if (funcCall) {
    return funcCall(prompt);
  }

  return classSelector(prompt);
};

const template = (key: string, prompt: string) => {
  return `You an experienced Javascript developer with experience using Jquery.
  Selector ${callFunctionFor(key, prompt)}`
};

router.get("/", async (req: express.Request, res: express.Response) => {
  try {
    const tokenLimit = 4097

    const prompt = req.query.prompt ? String(req.query.prompt) : '';
    const selectKey = req.query.selectKey ? String(req.query.selectKey) : 'class';

    const maxTokens = Math.round(tokenLimit - template(selectKey, prompt).length / 2.5);

    const jquery = await api.completions.create({
      model: 'text-davinci-003',
      prompt: template(selectKey, prompt),
      n: 1,
      temperature: 0,
      max_tokens: maxTokens,
      suffix: 'using the JQuery Library without comments'
    });

    // Check for Valid jquery that can be copy/pasted/just works
    const cleanText = (response: string | undefined) => {
      const removeComment = /\/\/(.+)/;
      return response?.replace(removeComment, '').replace('()', '');
    }
    fs.writeFileSync('./jquery.js', cleanText(jquery.choices[0].text) as string);
    res.status(200).send(cleanText(jquery.choices[0].text));
  } catch (error: any) {
    if (error.response) {
      console.log(error.response.status);
      console.log(error.response.data);
    } else {
      console.log(error.message);
    }
  }
});
