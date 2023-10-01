const util = require('util');
const setTimeoutPromise = util.promisify(setTimeout);

const cfg = {
  speakMode: false,
};

async function sleep(ms) {
  await setTimeoutPromise(ms);
}

async function printToConsole(
  title,
  titleColor,
  content,
  speakText = false,
  minTypingSpeed = 0.05,
  maxTypingSpeed = 0.01
) {
  if (speakText && cfg.speakMode) {
    // Implement speak functionality here
    console.log(`${title}. ${content}`);
  }

  process.stdout.write(titleColor + title + '\x1b[0m');
  if (content) {
    const contentString = Array.isArray(content) ? content.join(' ') : content;
    const words = contentString.split(' ');

    for (let i = 0; i < words.length; i++) {
      process.stdout.write(words[i]);

      if (i < words.length - 1) {
        process.stdout.write(' ');
      }

      const typingSpeed = Math.random() * (maxTypingSpeed - minTypingSpeed) + minTypingSpeed;
      await sleep(typingSpeed * 1000);

      minTypingSpeed *= 0.95;
      maxTypingSpeed *= 0.95;
    }
  }

  console.log();
}

(async () => {
  await printToConsole('Title:', '\x1b[31m', 'This is the content.', false);
})();