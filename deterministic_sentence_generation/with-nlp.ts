import nlp from 'compromise';

const subjects: string[] = ['The cat', 'A dog', 'A programmer'];
const verbs: string[] = ['eat', 'sleep', 'write'];
const objects: string[] = ['an apple', 'in the garden', 'TypeScript code'];
const adjectives: string[] = ['quickly', 'eagerly', 'meticulously'];

type SentenceTemplate = {
  subject: string;
  verb: string;
  object: string;
  adjective: string;
};

function generateSentence(index: number): string {
  const template: SentenceTemplate = {
    subject: subjects[index % subjects.length],
    verb: verbs[index % verbs.length],
    object: objects[index % objects.length],
    adjective: adjectives[index % adjectives.length],
  };

  // Conjugate verb to match the subject
  const verbDoc = nlp(template.verb);
  if (template.subject.startsWith('A')) {
    verbDoc.verbs().isSingular(); // Assume singular for 'A' (indefinite article)
  } else {
    verbDoc.verbs().isPlural(); // Assume plural for 'The' (definite article)
  }
  const conjugatedVerb = verbDoc.text();
  console.log(`${template.subject} ${conjugatedVerb} ${template.adjective} ${template.object}.`);
  return `${template.subject} ${conjugatedVerb} ${template.adjective} ${template.object}.`;
}

const index = 1;

generateSentence(3000)