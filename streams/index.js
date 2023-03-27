const { Readable, Transform, Writable, pipeline } = require('node:stream');
const { promisify } = require('node:util');

const asyncPipeline = promisify(pipeline);

(async () => {

  // create readable stream we pass through a transform
  const readableStream = Readable.from(['Hello', ' ', 'World', '!']);


  // transform the streamed data and modify it somehow
  const transformStream = new Transform({
    transform(chunk, encoding, callback) {
      this.push(chunk.toString().toUpperCase());
      callback();
    },
  });

  // we send this off when the incoming data is done being modified by the transform
  const writableStream = new Writable({
    write(chunk, encoding, callback) {
      console.log(chunk.toString());
      callback();
    },
  });

  try {
    await asyncPipeline(readableStream, transformStream, writableStream);
    console.log('Pipeline succeeded.');
  } catch (error) {
    console.error('Pipeline failed:', error.message);
  }
})();

