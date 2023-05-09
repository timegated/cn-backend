import * as express from 'express';
import { createEmbedding, promptResponseChat, promptResponseStream, promptResponseStreamChat } from '../../openai';
import { readFile } from 'fs-extra';
import { client } from '../..';
import { streamOn } from '../../utils';
import { ChatCompletionRequestMessage } from 'openai';
import GPT3Tokenizer from "gpt3-tokenizer";

export const router = express.Router();

router.get('/create-embedding', async (req: express.Request, res: express.Response) => {
  try {
    // Read/Process FILES
    const dataToProcess: string[] = [];
    const fileContents = await readFile('public/tmp/uploads/best-books-ever.csv', 'utf-8');
    fileContents.split(
      '\n'
    ).forEach((fC, idx) => {
      if (idx > 0) {
        dataToProcess.push(fC);
      }
    });

    // Call createEmbedding for each paragraph of the files that are processed
    for (let i = 0; i <= dataToProcess.length; i++) {
      console.log(dataToProcess[i]);
      const embeddingResult = await createEmbedding(dataToProcess[i]);
      if (embeddingResult) {
        const query = `INSERT INTO book_reviews (body, embedding) VALUES ('${dataToProcess[i].replace(/,|'/g, '')}', '[${embeddingResult[0].embedding}]')`
        await client.query(query);
      }
    }
    res.status(201).send('Embedding create success');
  } catch (error) {
    console.error(error);
    throw error;
  }
});

router.get('/embedding-response', async (req: express.Request, res: express.Response) => {
  try {
    const { query, match_threshold } = req.query;
    const queryText = query ? String(query).trim() : "";
    const embeddingResult = await createEmbedding(queryText);
    if (embeddingResult) {
      const [{ embedding }] = embeddingResult;
      const query = `SELECT body, 1 - (embedding <=> '[${embedding}]') as cosine_similiarity from book_reviews WHERE 1 - (embedding <=> '[${embedding}]') > ${match_threshold ?? 0.78} LIMIT 10`;

      const queryResult = await client.query(query);

      const queryResultFilter = queryResult.rows.filter((row) => {
        return row.body !== '\r'
      });
      res.status(200).send(queryResultFilter);
      return;
    } else {
      res.status(400).send('Bad Request');
    }
  } catch (error) {
    console.error(error);
  }
})

router.get('/book-reviews', async (req: express.Request, res: express.Response) => {
  try {
    const { query, match_threshold } = req.query;
    const queryText = query ? String(query).trim() : "";
    const embeddingResult = await createEmbedding(queryText);
    if (embeddingResult) {
      const [{ embedding }] = embeddingResult;
      const supabaseQuery = `SELECT body, 1 - (embedding <=> '[${embedding}]') as cosine_similiarity from book_reviews WHERE 1 - (embedding <=> '[${embedding}]') > ${match_threshold ?? 0.78} LIMIT 5`;

      const queryResult = await client.query(supabaseQuery);

      const queryResultFilter = queryResult.rows.filter((row) => {
        return row.body !== '\r'
      });


      const tokenizer = new GPT3Tokenizer({type: 'gpt3'});
      let tokenCount = 0;
      let contextText = '';

      for (let item of queryResultFilter) {
        const content = item.body;
        const encode = tokenizer.encode(content);
        tokenCount += encode.text.length;

        if (tokenCount >= 1500) {
          break;
        }

        contextText += `${item.body.trim()}\n--\n`;
      }

      const context = contextText.split('\n--\n').map((ctx) => {
        return {
          role: 'user',
          content: `Context: ${ctx}`
        }
      }) as ChatCompletionRequestMessage[];

      const promptMsgs = [
        {
          role: 'user',
          content: `You are a very enthusiastic book reviewer who loves to help people!
          Given the following sections from the a collection of book reviews answer the question using only that information`,
        },
        {
          role: 'user',
          content: 'If you are unsure, say "Sorry, I don\'t know how to help with that.'
        },
        {
          role: 'user',
          content: `Context: ${contextText}`
        },
        {
          role: 'user',
          content: `Question: ${query}`
        }
      ] as ChatCompletionRequestMessage[];
  
      console.log('Context Query', promptMsgs);
      const response = await promptResponseStreamChat(promptMsgs, "gpt-4", 6000)
      const stream = streamOn(response, true);
      stream.pipe(res);
    } else {
      res.status(400).send('Bad Request');
    }
  } catch (error) {
    // console.error(error);
  }
})

router.get('/dev-docs', async (req: express.Request, res: express.Response) => {
  try {
    const { query, match_threshold } = req.query;
    const queryText = query ? String(query).trim() : "";
    const embeddingResult = await createEmbedding(queryText);
    if (embeddingResult) {
      const [{ embedding }] = embeddingResult;
      const supabaseQuery = `SELECT body, 1 - (embedding <=> '[${embedding}]') as cosine_similiarity from doc_data WHERE 1 - (embedding <=> '[${embedding}]') > ${match_threshold ?? 0.78} LIMIT 20`;

      const queryResult = await client.query(supabaseQuery);

      const queryResultFilter = queryResult.rows.filter((row) => {
        return row.body !== '\r'
      });


      const tokenizer = new GPT3Tokenizer({type: 'gpt3'});
      let tokenCount = 0;
      let contextText = '';

      for (let item of queryResultFilter) {
        const content = item.body;
        const encode = tokenizer.encode(content);
        tokenCount += encode.text.length;

        if (tokenCount >= 1500) {
          break;
        }

        contextText += `${item.body.trim()}\n--\n`;
      }

      const context = contextText.split('\n--\n').map((ctx) => {
        return {
          role: 'user',
          content: `Context: ${ctx}`
        }
      }) as ChatCompletionRequestMessage[];
      const prompt = `
      You are a very enthusiastic documentation subject matter expert who loves to help people!
      Given the following sections from the a collection of technical documentation about various programming concepts answer the question using only that information
      If you are unsure, review the provided context and give your best answer
      Context:
      ${contextText}
      Question:
      ${query}
      `
      const promptMsgs = [
        {
          role: 'system',
          content: `You are a very enthusiastic documentation subject matter expert who loves to help people!
          Given the following sections from the a collection of technical documentation about various programming concepts answer the question using only that information`,
        },
        {
          role: 'assistant',
          content: 'If you are unsure, review the provided context and give your best answer'
        },
        {
          role: 'assistant',
          content: `Context: ${contextText}`
        },
        {
          role: 'assistant',
          content: `Question: ${query}`
        }
      ] as ChatCompletionRequestMessage[];
      
      console.log('Context Query', prompt);
      // const response = await promptResponseStreamChat(promptMsgs, "gpt-4", 6000);
      const response = await promptResponseChat(promptMsgs, "gpt-4-0314", 6000);
      
      const stream = streamOn(response, false);
      stream.pipe(res);
    } else {
      res.status(400).send('Bad Request');
    }
  } catch (error) {
    // console.error(error);
  }
})

