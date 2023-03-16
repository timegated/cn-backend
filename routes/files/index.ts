import * as express from 'express';
import multer from 'multer';
import fs from 'fs';
import { uploadFile, listFiles, singleFile } from '../../openai';

export const router = express.Router();
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/tmp/uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + '.' + file.originalname.split('.').pop());
  },
});

const upload = multer({ storage });


router.get('/', async (req: express.Request, res: express.Response) => {
  try {
    res.status(200).send('Welcome to the Files Routes');
  } catch (error) {
    throw error;
  }
});

router.post('/upload', upload.single('file'), async (req: express.Request, res: express.Response) => {
  try {
    if (req.file) {
      const readFile = fs.createReadStream(req.file.path);
      const createFile = await uploadFile(readFile, 'fine-tune');
      res.status(201).send({ ...createFile });
    } else {
      res.status(400).send('Error: file and purpose are both required');
    }
  } catch (error) {
    throw error;
  }
})


router.get('/list', async (req: express.Request, res: express.Response) => {
  try {
    const files = await listFiles();
    res.status(200).send(files);
  } catch (error) {
    throw error;
  }
})

router.get('/single', async (req: express.Request, res: express.Response) => {
  try {
    const { fileId } = req.query;
    if (fileId) {
      const file = await singleFile(String(fileId));
      res.status(200).send(file);
      return;
    }
    res.status(400).send('File Id required.');
  } catch (error) {
    throw error;
  }
})