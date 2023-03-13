import * as express from 'express';
import {api} from '../openai'
export const router = express.Router();

import * as answers from './answers';
import * as stream from './stream';
import * as engines from './engines';
import * as jquery from './jquery';

router.use('/answer', answers.router);
router.use('/stream', stream.router);
router.use('/engines', engines.router);
router.use('/jquery', jquery.router);

router.use('/', async (req: express.Request, res: express.Response) => {
  try {
    res.status(200).send('Welcome to the Chat Node Backend');
  } catch (error) {
    console.error(error);
  }
})