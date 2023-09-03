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
    res.status(200).send('No Engines');
  } catch (error) {
    console.error(error);
  }
});
