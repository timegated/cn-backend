import express from "express";
import * as routes from './routes';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3002;

export const handlePreFlight = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
): Promise<void> => {
  res.header("Access-Control-Allow-Origin", req.get("origin"));
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Authorization, Cache-Control");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
  if (req.header("access-control-request-headers")) {
      return;
  }
  next();
};

app.use(cors());
app.use(handlePreFlight);
app.use('/', routes.router);

app.listen(PORT, () => {
  console.log(`Openai experiment running on port: ${PORT}`);
});
