/**
 * Insert before what a user types if they select this option.
 * This will most likely become a separate piece of the application that only deals with
 * engineering the prompts for more effective answers.
 * Expecting lots of work with strings here with JS is more than equipped to handle
 */
export const promptPrependSimple = [
  {
    type: "WHAT",
    prepend: "What is a",
  },
  {
    type: "ROLE",
    prepend: "Assume the role of a",
  },
  {
    type: "EXP",
    prepend: "Explain",
  },
];

export const promptPrependDetailed = [
  {
    type: "WHAT",
    prepend: {
      first: "What is",
      second: "What is a",
      third: "What if",
      fourth: "What",
    },
  },
  {
    type: "ROLE",
    prepend: {
        first: 'Assume the role of a',
        second: "Assume the role as a",
        third: "Assume the role as a very talented",
        fourth: "You are a very valented",
        fifth: "You have strong background in",
        sixth: "You are very knowledgeable about",
    }
  },
  {
    type: "EXPLAIN",
    prepend: {
        first: "Explain in simple terms",
        second: "Explain in complex terms",
        third: "Explain in no uncertain terms",
        fourth: "Explain in great detail",
        fifth: "Explain in as much detail as possible",
        sixth: "Explain at a high level",
        seventh: "Explain with enough detail",
        eigth: "Explain at a low level",
    }
  }
];
