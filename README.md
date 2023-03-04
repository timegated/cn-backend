### Chat-GPT + Node Test


The goal here is to leverage the fairly new openai-node package so that we can explore what it might be capable of for commercial applications, code analysis, code generation, or file analysis/generation or anything else we can think of.


### Ideas So far:

1. Chat GPT as a logging tool for requests over a network.
2. Chat GPT as an analytical tool for legacy code (or anything we find where we're not sure what it does)
3. File analysis tool (think feeds).
4. Code generation via a prompt editor with helpful hints/course correction.

### To Run This Project

- Clone the repository, follow format in .env.example. Find invite for openai and copy APIKey into env file that you create.

- Run npm start. 

- May occasionally have to restart nodemon from time to time.

### TODO: 

- Implement retries after errors involving rate limit after a delay.