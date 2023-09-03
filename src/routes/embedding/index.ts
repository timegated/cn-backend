import * as express from "express";
import {
  createEmbedding,
  promptResponseChat,
  promptResponseStream,
  promptResponseStreamChat,
} from "../../openai";
import { readFile } from "fs-extra";
import { client } from "../..";
import { streamOn } from "../../utils";
import Completion from "openai";
import GPT3Tokenizer from "gpt3-tokenizer";

export const router = express.Router();

router.get(
  "/create-embedding",
  async (req: express.Request, res: express.Response) => {
    try {
      // Read/Process FILES
      const dataToProcess: string[] = [];
      const fileContents = await readFile(
        "public/tmp/uploads/best-books-ever.csv",
        "utf-8"
      );
      fileContents.split("\n").forEach((fC, idx) => {
        if (idx > 0) {
          dataToProcess.push(fC);
        }
      });

      // Call createEmbedding for each paragraph of the files that are processed
      for (let i = 0; i <= dataToProcess.length; i++) {
        console.log(dataToProcess[i]);
        const embeddingResult = await createEmbedding(dataToProcess[i]);
        if (embeddingResult) {
          const query = `INSERT INTO book_reviews (body, embedding) VALUES ('${dataToProcess[
            i
          ].replace(/,|'/g, "")}', '[${embeddingResult[0].embedding}]')`;
          await client.query(query);
        }
      }
      res.status(201).send("Embedding create success");
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
);

router.get(
  "/book-reviews",
  async (req: express.Request, res: express.Response) => {
    try {
      const { query, match_threshold } = req.query;
      const queryText = query ? String(query).trim() : "";
      const embeddingResult = await createEmbedding(queryText);
      if (embeddingResult) {
        const [{ embedding }] = embeddingResult;
        const query = `SELECT body, 1 - (embedding <=> '[${embedding}]') as cosine_similiarity from book_reviews WHERE 1 - (embedding <=> '[${embedding}]') > ${
          match_threshold ?? 0.78
        } LIMIT 10`;

        const queryResult = await client.query(query);

        const queryResultFilter = queryResult.rows.filter((row) => {
          return row.body !== "\r";
        });
        res.status(200).send(queryResultFilter);
        return;
      } else {
        res.status(400).send("Bad Request");
      }
    } catch (error) {
      console.error(error);
    }
  }
);

router.get("/dev-docs", async (req: express.Request, res: express.Response) => {
  try {
    const { query, match_threshold } = req.query;
    const queryText = query ? String(query).trim() : "";
    const embeddingResult = await createEmbedding(queryText);
    if (embeddingResult) {
      const [{ embedding }] = embeddingResult;
      const query = `SELECT body, 1 - (embedding <=> '[${embedding}]') as cosine_similiarity from doc_data WHERE 1 - (embedding <=> '[${embedding}]') > ${
        match_threshold ?? 0.78
      } LIMIT 20`;

      const queryResult = await client.query(query);

      const queryResultFilter = queryResult.rows.filter((row) => {
        return row.body !== "\r";
      });
      res.status(200).send(queryResultFilter);
      return;
    } else {
      res.status(400).send("Bad Request");
    }
  } catch (error) {
    console.error(error);
  }
});

router.get(
  "/book-reviews-query",
  async (req: express.Request, res: express.Response) => {
    res.set({
      "Cache-Control": "no-cache",
      "Content-Type": "application/json",
      "Text-Encoding": "chunk",
    });

    try {
      const { query, match_threshold } = req.query;
      const queryText = query ? String(query).trim() : "";
      const embeddingResult = await createEmbedding(queryText);
      if (embeddingResult) {
        const [{ embedding }] = embeddingResult;
        const supabaseQuery = `SELECT body, 1 - (embedding <=> '[${embedding}]') as cosine_similiarity from book_reviews WHERE 1 - (embedding <=> '[${embedding}]') > ${
          match_threshold ?? 0.78
        } LIMIT 5`;

        const queryResult = await client.query(supabaseQuery);

        const queryResultFilter = queryResult.rows.filter((row) => {
          return row.body !== "\r";
        });

        const tokenizer = new GPT3Tokenizer({ type: "gpt3" });
        let tokenCount = 0;
        let contextText = "";

        for (let item of queryResultFilter) {
          const content = item.body;
          const encode = tokenizer.encode(content);
          tokenCount += encode.text.length;

          if (tokenCount >= 1500) {
            break;
          }

          contextText += `${item.body.trim()}\n--\n`;
        }

        const context = contextText.split("\n--\n").map((ctx) => {
          return {
            role: "user",
            content: `Context: ${ctx}`,
          };
        }) as any[];

        const promptMsgs = [
          {
            role: "user",
            content: `You are a very enthusiastic book reviewer who loves to help people!
          Given the following sections from the a collection of book reviews answer the question using only that information`,
          },
          {
            role: "user",
            content:
              "If you are unsure, say \"Sorry, I don't know how to help with that.",
          },
          {
            role: "user",
            content: `Context: ${contextText}`,
          },
          {
            role: "user",
            content: `Question: ${query}`,
          },
        ] as any[];

        console.log("Context Query", promptMsgs);
        const response = await promptResponseStreamChat(
          promptMsgs,
          "gpt-4",
          6000
        );
        const stream = streamOn(response, true);
        stream.pipe(res);
      } else {
        res.status(400).send("Bad Request");
      }
    } catch (error) {
      // console.error(error);
    }
  }
);

router.get(
  "/dev-docs-query",
  async (req: express.Request, res: express.Response) => {
    res.set({
      "Cache-Control": "no-cache",
      "Content-Type": "application/json",
      "Text-Encoding": "chunk",
    });

    try {
      const { query, match_threshold, links } = req.query;
      const queryText = query ? String(query).trim() : "";
      const queryLink = links ? String(links).trim() : "";

      const embeddingResult = await createEmbedding(queryText);
      if (embeddingResult) {
        const [{ embedding }] = embeddingResult;
        const supabaseQuery = `SELECT body, 1 - (embedding <=> '[${embedding}]') as cosine_similiarity from doc_data WHERE 1 - (embedding <=> '[${embedding}]') > ${
          match_threshold ?? 0.78
        } ORDER BY cosine_similiarity LIMIT 50`;
        const supabaseQueryLinks = `SELECT body, 1 - (embedding <=> '[${embedding}]') as cosine_similiarity from doc_links WHERE 1 - (embedding <=> '[${embedding}]') > ${
          match_threshold ?? 0.78
        } AND body like '%https://%' AND body like '%${queryLink}%' ORDER BY cosine_similiarity desc LIMIT 50`;

        const queryResult = await client.query(supabaseQuery);
        const queryLinksResult = (await client.query(supabaseQueryLinks)).rows;

        console.log(queryLinksResult);
        const queryResultFilter = queryResult.rows.filter((row) => {
          return row.body !== "\r";
        });

        const tokenizer = new GPT3Tokenizer({ type: "gpt3" });
        let tokenCount = 0;
        let contextText = "";

        for (let item of queryResultFilter) {
          const content = item.body;
          const encode = tokenizer.encode(content);
          tokenCount += encode.text.length;

          if (tokenCount >= 1500) {
            break;
          }

          contextText += `${item.body.trim()}\n--\n`;
        }

        let links = "";
        let linkTokenCount = 0;
        queryLinksResult.slice(0, 10).forEach((link) => {
          links += `${link.body.trim()},`;
        });

        const promptMsgs = [
          {
            role: "user",
            content: `You are a very enthusiastic documentation subject matter expert who loves to help people!
          Given the following sections from the a collection of technical documentation from devdocs.io about various programming concepts answer the question using only that information`,
          },
          {
            role: "user",
            content:
              'If you are unsure, say "Sorry I don\'t know how to help with that".',
          },
          {
            role: "user",
            content:
              "Find and provide appropriate Links where necessary, if there are no appropriate links from the Links do not provide any",
          },
          {
            role: "user",
            content: `Context: ${contextText}`,
          },
          {
            role: "user",
            content: `Links: ${links}`,
          },
          {
            role: "user",
            content: `Question: ${query}`,
          },
        ] as any[];

        console.log("Context Query", promptMsgs);
        const response = await promptResponseStreamChat(
          promptMsgs,
          "gpt-4",
          6000
        );
        const stream = streamOn(response, true);
        stream.pipe(res);
      } else {
        res.status(400).send("Bad Request");
      }
    } catch (error) {
      console.error(error);
    }
  }
);
router.get(
  "/dev-docs-embed-query",
  async (req: express.Request, res: express.Response) => {
    res.set({
      "Cache-Control": "no-cache",
      "Content-Type": "application/json",
      "Text-Encoding": "chunk",
    });

    try {
      const { query, match_threshold, link} = req.query;
      const queryText = query ? String(query).trim() : "";
      const linkText = link ? String(link).trim() : "";
      const embeddingResult = await createEmbedding(queryText);
      if (embeddingResult) {
        const [{ embedding }] = embeddingResult;
        const supabaseQuery = `SELECT body, 1 - (embedding <=> '[${embedding}]') as cosine_similiarity from doc_data WHERE 1 - (embedding <=> '[${embedding}]') > ${
          0.78
        } LIMIT 50`;
        const supabaseQueryLinks = `SELECT body, 1 - (embedding <=> '[${embedding}]') as cosine_similiarity from doc_links WHERE 1 - (embedding <=> '[${embedding}]') > ${
          match_threshold ?? 0.78
        } AND body like '%https://%' AND body like '%${linkText}%' ORDER BY cosine_similiarity desc LIMIT 50`;

        const queryResult = await client.query(supabaseQuery);
        const queryLinksResult = (await client.query(supabaseQueryLinks)).rows;
        console.log(queryLinksResult);
        const queryResultFilter = queryResult.rows.filter((row) => {
          return row.body !== "\r";
        });

        const tokenizer = new GPT3Tokenizer({ type: "gpt3" });
        let tokenCount = 0;
        let contextText = "";

        for (let item of queryResultFilter) {
          const content = item.body;
          const encode = tokenizer.encode(content);
          tokenCount += encode.text.length;

          if (tokenCount >= 3000) {
            break;
          }

          contextText += `${item.body.trim()}\n--\n`;
        }
        let links: string[] = [];
        queryLinksResult.forEach((link) => {
          links.push(`${link.body.trim()},`);
        });
        res.send({contextText, links});
      } else {
        res.status(400).send("Bad Request");
      }
    } catch (error) {
      console.error(error);
    }
  }
);
