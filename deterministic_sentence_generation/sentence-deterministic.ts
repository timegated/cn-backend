// Define sets of words for different grammatical constructs
const subjects: string[] = ['The cat', 'A dog', 'A programmer'];
const verbs: string[] = ['eats', 'sleeps', 'writes'];
const objects: string[] = ['an apple', 'in the garden', 'TypeScript code'];
const adjectives: string[] = ['quickly', 'eagerly', 'meticulously'];

// A basic sentence structure template
type SentenceTemplate = {
  subject: string;
  verb: string;
  object: string;
  adjective: string;
};

// Generate a deterministic sentence
function generateSentence(index: number): string {
  const template: SentenceTemplate = {
    subject: subjects[index % subjects.length],
    verb: verbs[index % verbs.length],
    object: objects[index % objects.length],
    adjective: adjectives[index % adjectives.length],
  };

  return `${template.subject} ${template.verb} ${template.adjective} ${template.object}.`;
}

// Usage
const index = 3;
console.log(generateSentence(index)); 