import * as express from 'express';
import { BayesClassifier, WordNet } from 'natural';


const classifier = new BayesClassifier();
const wordNet = new WordNet();
export const router = express.Router();

router.get('/', async (req: express.Request, res: express.Response) => {
const training: string[][] = [];

for (const data of training) {
  classifier.addDocument(data[0], data[1]);
}

classifier.train();

  try {
    const { userText } = req.query;

    if (userText && userText !== '') {
      const result = classifier.classify(String(userText));

      res.status(200).json(result);
      return;
    }
    res.status(400).send('Bad Request').end();
  } catch (error) {
    res.status(500).send('Internal Server Error');
    throw error;
  }
})


router.get('/lookup/:word', async (req: express.Request, res: express.Response) => {
  try {
    const { word } = req.params;
    if (word && word !== '') {
      const result = await lookupWord(String(word));
      const wordInfo = result.map((res) => {
        return {
          def: res.def,
          synonyms: res.synonyms
        }
      });
      res.status(200).json(wordInfo);
      return;
    }
    res.status(400).send('Bad Request');
  } catch (error) {
    res.status(500).send('Internal Server Error');
    throw error;
  }
})


function lookupWord(word: string): Promise<any[]> {
  return new Promise((resolve, reject) => {
    wordNet.lookup(word, (results) => {
      if (results) {
        resolve(results);
      } else {
        reject(new Error('Failed to execute word lookup'));
      }
    })
  })
}