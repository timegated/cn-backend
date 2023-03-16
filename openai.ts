import { Configuration, OpenAIApi } from "openai";
import {Readable } from 'stream';

require('dotenv').config()

const config = new Configuration({
  apiKey: process.env.GPT_SECRET,
});

export const api = new OpenAIApi(config);

export async function promptResponse(
  promptText: string,
  model: string,
  maxTokens: number
) {
  try {
    const completion = await api.createCompletion({
      model: model,
      prompt: `${promptText}`,
      max_tokens: maxTokens,
      n: 1,
      temperature: 0.1,
      stream: true,
    });
    return completion.data.choices[0].text;
  } catch (error: any) {
    if (error.response) {
      console.log(error.response.status);
      console.log(error.response.data);
    } else {
      console.log(error.message);
    }
  }
}

export async function promptResponseMultiple(
  promptText: string,
  model: string,
  maxTokens: number,
) {
  try {
    const completion = await api.createCompletion({
      model: model,
      prompt: `${promptText}`,
      max_tokens: maxTokens,
      n: 1,
    });
    const text: string[] = [];
    completion.data.choices.forEach((choice: any) => {
      text.push(choice);
    });
    return text;
  } catch (error: any) {
    if (error.response) {
      console.log(error.response.status);
      console.log(error.response.data);
    } else {
      console.log(error.message);
    }
  }

}

export async function promptResponseStream(
  prompt: string,
  model: string,
  maxTokens: number
) {
  try {
    const res = await api.createCompletion(
      {
        model: model,
        prompt: `${prompt}`,
        max_tokens: maxTokens,
        temperature: 0,
        stream: true,
      },
      { responseType: "stream" }
    );
    
    const stream = Readable.from(res.data as any);

    return stream;
  } catch (error: any) {
    if (error.response?.status) {
      error.response.data.on("data", (data: Buffer) => {
        const message = data.toString();
        try {
          const parsed = JSON.parse(message);
          console.error("An error occurred during OpenAI request: ", parsed);
        } catch (error) {
          console.error("An error occurred during OpenAI request: ", message);
        }
      });
    } else {
      console.error("An error occurred during OpenAI request", error);
    }
    throw error;
  }
}
/** ENGINES */
export async function listEngines () {
  try {
    const res = await api.listModels({
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return res.data;
  } catch (error: any) {
    if (error.response) {
      console.log(error.response.status);
      console.log(error.response.data);
    } else {
      console.log(error.message);
    }
  }
}

/** FILES */
export async function uploadFile(
  file: any,
  purpose: string,
) {
  try {
    // Implement file upload
    const createFile = await api.createFile(file, purpose);
    return createFile.data;
  } catch (error: any) {
    if (error.response) {
      console.log(error.response.status);
      console.log(error.response.data);
    } else {
      console.log(error.message);
    }
  }
}

export async function listFiles() {
  try {
    const listFiles = await api.listFiles();
    return listFiles.data;
  } catch (error: any) {
    if (error.response) {
      console.log(error.response.status);
      console.log(error.response.data);
    } else {
      console.log(error.message);
    }
  }
}

export async function singleFile (id: string) {
  try {
    const singleFile = await api.retrieveFile(id);
    return singleFile.data;
  } catch (error: any) {
    if (error.response) {
      console.log(error.response.status);
      console.log(error.response.data);
    } else {
      console.log(error.message);
    }
  }
}

export async function promptCreateFineTune() {
  try {
    const fineTune = await api.createFineTune(
      {
        training_file: ''
      }
    );
  } catch (error: any) {
    if (error.response) {
      console.log(error.response.status);
      console.log(error.response.data);
    } else {
      console.log(error.message);
    }
  }
}