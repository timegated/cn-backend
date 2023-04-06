import * as express from 'express';
import { client } from '../..';


export const router = express.Router();


router.post('/save-response', async (req: express.Request, res: express.Response) => {
  try {
    console.log(req.body);
    const {text, prompt} = req.body;

    console.log(text, prompt);
    const query = `INSERT INTO saved_responses (saved_response) VALUES ($1)`;
    const values = [req.body];
    console.log(query);
    await client.query(query, values);

    res.status(201).send('Response saved');
  } catch (error) {
    res.status(400).send('Bad Request');
  }
});
