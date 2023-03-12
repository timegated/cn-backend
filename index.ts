import express from "express";
import * as routes from './routes';
import cors from 'cors';
import bodyParser from 'body-parser';

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use('/', routes.router);

app.listen(PORT, () => {
  console.log('OpenAI API server running');
})
