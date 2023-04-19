import * as express from 'express';
import { createEmbedding, promptResponseChat, promptResponseStreamChat } from '../../openai';
import { readFile } from 'fs-extra';
import { client } from '../..';
import { codeBlock, oneLine } from 'common-tags';
import { streamOn } from '../../utils';
import { ChatCompletionRequestMessage } from 'openai';

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
    // Call createEmbedding for each file of the files that are processed
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

      console.log(queryResultFilter)
      let contextText = '';
      for (let item of queryResultFilter) {
        contextText += `${item.body.trim()}\n--\n`;
      }

      const promptMsgs = [
        {
          role: 'user',
          content: 'You are a very enthusiastic book reviewer who loves to help people!',
        },
        {
          role: 'user',
          content: 'Given the following sections from the a collection of book reviews answer the question using only that information'
        },
        {
          role: 'user',
          content: 'If you are unsure and the answer is not explicitly written in the book review, say "Sorry, I don\'t know how to help with that.'
        },
        {
          role: 'user',
          content: contextText
        },
        {
          role: 'user',
          content: query
        }
      ] as ChatCompletionRequestMessage[];
      console.log(promptMsgs);
      const response = await promptResponseStreamChat(promptMsgs, "gpt-3.5-turbo", 2000)
      const stream = streamOn(response, true);
      stream.pipe(res);
      // const response = await promptResponseChat(promptMsgs, "gpt-3.5-turbo", 4096, 1, 0.1, 'markdown')
      //   const stream = streamOn(response?.data, true);
      //   stream.pipe(res, {end: false});
    } else {
      res.status(400).send('Bad Request');
    }
  } catch (error) {
    // console.error(error);
  }
})
