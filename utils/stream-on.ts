import { Readable, Transform } from "stream";
import { parseStreamData, extractLines } from "./index";

export const streamOn = (result: any) => {
    const readable = Readable.from(result);
    const delay = new Transform({
      transform(chunk, enc, cb) {
        const parseChunk = parseStreamData(extractLines(chunk));
        setTimeout(cb, 50, null, parseChunk)
      },
    });
    return readable.pipe(delay);
  };

