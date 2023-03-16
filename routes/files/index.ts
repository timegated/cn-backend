import * as express from 'express';
import { uploadFile } from '../../openai';

export const router = express.Router();


router.get('/upload', async (req: express.Request, res: express.Response) => {
  try {
    const {file, purpose} = req.query;
    if (file && purpose){
      const fileUploadSuccess = await uploadFile(file, String(purpose))
      console.log(fileUploadSuccess);
      res.sendStatus(200).send(fileUploadSuccess);
    } else {
      res.sendStatus(404).send('File and purpose are both required');
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
})