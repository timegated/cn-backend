import * as express from "express";
import { listEngines } from "../../openai";

export const router = express.Router();

router.get("/", async (req: express.Request, res: express.Response) => {
  try {
    const engines = await listEngines();
    if (engines) {
      res.status(200).json(engines);
      return;
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});
