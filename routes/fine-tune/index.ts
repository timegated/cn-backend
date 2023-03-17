import * as express from 'express'
import { createFinetune, retrieveFineTune } from '../../openai';

export const router = express.Router();

router.post('/', async (req: express.Request, res: express.Response) => {
  try {
    const {id} = req.body;
    if (id) {
      const fineTune = await createFinetune({
        id
      });
      res.status(200).send(fineTune);
      return;
    }
    res.status(400).send('Bad Request');
  } catch (error) {
    throw error;
  }
});

router.get('/status/:id', async (req: express.Request, res: express.Response) => {
  try {
    const id = req.params.id;
    if (id) {
      const retrieve = await retrieveFineTune(id)
      res.status(200).send(retrieve);
      return;
    }
    res.status(400).send('Bad Request');
  } catch (error) {
    throw error;
  }
})