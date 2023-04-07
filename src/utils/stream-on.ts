import { Readable, Transform } from "stream";

const extractLines = (data: Buffer): string[] => {
  return data
    .toString()
    .split("\n")
    .filter((line: string) => line);
}

const parseStreamData = (chatCompletion: boolean, lines: string[]) => {
  for (const line of lines) {
    const message = line.replace(/^data: /g, "");
    if (message === "[DONE]") {
      return; // Stream finished
    }
    try {
      const parsed = JSON.parse(message);
      const choices = parsed.choices.map((choice: any) => {
        return chatCompletion ? choice.delta.content : choice.text;
      });
      return choices.join(' ');
    } catch (error) {
      console.error("Could not JSON parse stream message", message, error);
    }
  }
}

export const streamOn = (result: any, chatCompletion: boolean) => {
    const readable = Readable.from(result, {objectMode: false});
    const delay = new Transform({
      objectMode: false,
      transform(chunk, enc, cb) {
        const parseChunk = parseStreamData(chatCompletion, extractLines(chunk));
        setTimeout(cb, 50, null, parseChunk)
      },
    });
    return readable.pipe(delay);
  };

