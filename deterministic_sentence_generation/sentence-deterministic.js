"use strict";
// Define sets of words for different grammatical constructs
const subjects = ['The cat', 'A dog', 'A programmer'];
const verbs = ['eats', 'sleeps', 'writes'];
const objects = ['an apple', 'in the garden', 'TypeScript code'];
const adjectives = ['quickly', 'eagerly', 'meticulously'];
// Generate a deterministic sentence
function generateSentence(index) {
    const template = {
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
