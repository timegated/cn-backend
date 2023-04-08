// // @ts-nocheck
// import * as express from 'express';
// import Markov from 'js-markov';
// import { WordNet } from 'natural';
// import fs from 'fs';
// import path from 'path';

// const wordNet = new WordNet();
// const markovChain = new Markov();

// export const router = express.Router();

// router.get('/', trainModel, async (req: express.Request, res: express.Response) => {
//   try {
//     const { topic } = req.query;

//     if (topic && topic !== '') {
//       console.log('building sentence');
//       const questions = [];

//       for (let i = 0; i < 20; i++) {
//         questions.push(markovChain.generateRandom(100));
//       }
//       if (questions.length === 20) {
//         res.status(200).json(questions);
//         return;
//       } else {
//         res.status(200).send({});
//       }
//     }
//     res.status(400).send('Bad Request').end();
//   } catch (error) {
//     res.status(500).send('Internal Server Error');
//     throw error;
//   }
// })

// router.get('/lookup/:word', async (req: express.Request, res: express.Response) => {
//   try {
//     const { word } = req.params;
//     if (word && word !== '') {
//       const result = await lookupWord(String(word));
//       const wordInfo = result.map((res) => {
//         return {
//           def: res.def,
//           synonyms: res.synonyms
//         }
//       });
//       res.status(200).json(wordInfo);
//       return;
//     }
//     res.status(400).send('Bad Request');
//   } catch (error) {
//     res.status(500).send('Internal Server Error');
//     throw error;
//   }
// })


// function lookupWord(word: string): Promise<any[]> {
//   return new Promise((resolve, reject) => {
//     wordNet.lookup(word, (results) => {
//       if (results) {
//         resolve(results);
//       } else {
//         reject(new Error('Failed to execute word lookup'));
//       }
//     })
//   })
// }


// function trainModel (req:express.Request, res: express.Response, next: express.NextFunction) {
//   const filePath = path.join(__dirname, '../../../data/prompt-templates.txt');
//   fs.readFile(filePath, 'utf-8', (err, data) => {
//     if (err) {
//       console.error('Error reading the file:', err);
//     }
//     const sentenceArr = data.split('\n');
//     markovChain.addStates(sentenceArr);
//     markovChain.train();
//   });
//   next();
// }