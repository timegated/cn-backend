import express from "express";
import * as routes from './routes';
import cors from 'cors';
import bodyParser from 'body-parser';
import { Client } from 'pg';


const supabaseUrl = 'db.hnyhnbtdxhqmcvsgagxa.supabase.co';
const supabasePort = 5432;
const supabaseDbName = 'postgres';
const supabaseUser = 'postgres';
const supabasePassword = process.env.SUPABASE_POSTGRES;

export const client = new Client({
  host: supabaseUrl,
  port: supabasePort,
  database: supabaseDbName,
  user: supabaseUser,
  password: supabasePassword,
  ssl: { rejectUnauthorized: false },
});

client.connect();

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use('/', routes.router);

app.listen(PORT, () => {
  console.log('OpenAI API server running');
})
