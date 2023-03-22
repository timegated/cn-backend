"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const compromise_1 = __importDefault(require("compromise"));
const subjects = ['The cat', 'A dog', 'A programmer'];
const verbs = ['eat', 'sleep', 'write'];
const objects = ['an apple', 'in the garden', 'TypeScript code'];
const adjectives = ['quickly', 'eagerly', 'meticulously'];
function generateSentence(index) {
    const template = {
        subject: subjects[index % subjects.length],
        verb: verbs[index % verbs.length],
        object: objects[index % objects.length],
        adjective: adjectives[index % adjectives.length],
    };
    // Conjugate verb to match the subject
    const verbDoc = (0, compromise_1.default)(template.verb);
    if (template.subject.startsWith('A')) {
        verbDoc.verbs().isSingular(); // Assume singular for 'A' (indefinite article)
    }
    else {
        verbDoc.verbs().isPlural(); // Assume plural for 'The' (definite article)
    }
    const conjugatedVerb = verbDoc.text();
    console.log(`${template.subject} ${conjugatedVerb} ${template.adjective} ${template.object}.`);
    return `${template.subject} ${conjugatedVerb} ${template.adjective} ${template.object}.`;
}
const index = 1;
generateSentence(3000);
