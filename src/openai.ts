import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from "openai";
import { Readable } from 'stream';
import { streamOn } from "./utils";

require('dotenv').config()

const config = new Configuration({
  apiKey: process.env.GPT_SECRET,
});

export const api = new OpenAIApi(config);

interface FineTuneParams {
  id: string;
  validationFile?: string | null;
  model?: string | null;
  nEpochs?: number | null;
  batchSize?: number | null;
  learningRateMultiplier?: number | null;
  promptLossWeight?: number | null;
  computeClassificationMetrics?: boolean | null;
  classificationNClasses?: number | null;
  classificationPositiveClass?: string | null;
  classificationBetas?: number[] | null;
  suffix?: string | null;
}


/** COMPLETIONS */
export async function promptResponse(
  promptText: string,
  model: string,
  maxTokens: number,
  numResponses: number,
  temperature: number,
  responseAs: string
) {
  try {
    const completion = await api.createCompletion({
      model: model,
      prompt: `${promptText}, return the response as ${responseAs}`,
      max_tokens: maxTokens,
      n: numResponses,
      temperature: temperature,
    });
    if (numResponses === 1) return completion.data.choices[0].text;
    return completion.data.choices.map((choice: any) => {
      return choice.text;
    });
  } catch (error: any) {
    if (error.response) {
      console.log(error.response.status);
      console.log(error.response.data);
    } else {
      console.log(error.message);
    }
  }
}

export async function promptResponseChat(
  msg: ChatCompletionRequestMessage | ChatCompletionRequestMessage[],
  model: string,
  maxTokens: number,
  numResponses: number,
  temperature: number,
  responseAs: string
) {
  try {
    const res = await api.createChatCompletion(
      {
        model: model,
        messages: Array.isArray(msg) ? msg : [msg],
        max_tokens: maxTokens,
        n: 1,
        stream: true,
        presence_penalty: 1,
        temperature: 0,
        frequency_penalty: 1,
      },
      { responseType: 'stream' }
    );
    console.log(msg);
    return res;
  } catch (error: any) {
    if (error.response) {
      console.log(error.response.status);
      console.log(error.response.data);
    } else {
      console.log(error.message);
    }
  }
}

/** STREAMS */
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
    return res.data;
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

export async function promptResponseStreamChat(
  msgs: ChatCompletionRequestMessage | ChatCompletionRequestMessage[],
  model: string,
  maxTokens: number,
) {
  try {
    // console.log(msgs);
    const res = await api.createChatCompletion(
      {
        model: model,
        messages: msgs && Array.isArray(msgs) ? msgs : [msgs],
        max_tokens: maxTokens,
        n: 1,
        stream: true,
        presence_penalty: 1,
        temperature: 0,
        frequency_penalty: 1,
      },
      { responseType: 'stream' }
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
export async function listEngines() {
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

export async function singleFile(id: string) {
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

export async function deleteFile(id: string) {
  try {
    const deleteFile = await api.deleteFile(id);
    return deleteFile.data;
  } catch (error: any) {
    if (error.response) {
      console.log(error.response.status);
      console.log(error.response.data);
    } else {
      console.log(error.message);
    }
  }
}

/** FINE TUNE */
export async function createFinetune(params: FineTuneParams) {
  try {
    const fineTune = await api.createFineTune({
      training_file: params.id,
    });
    return fineTune.data;
  } catch (error: any) {
    if (error.response) {
      console.log(error.response.status);
      console.log(error.response.data);
    } else {
      console.log(error.message);
    }
  }
}

export async function retrieveFineTune(id: string) {
  try {
    const retrieve = await api.retrieveFineTune(id);
    return retrieve.data;
  } catch (error: any) {
    if (error.response) {
      console.log(error.response.status);
      console.log(error.response.data);
    } else {
      console.log(error.message);
    }
  }
}

/** EMBEDDINGS */
export async function createEmbedding(input: string) {
  try {
    const createResponse = await api.createEmbedding({ model: "text-embedding-ada-002", input });

    return createResponse.data.data;
  } catch (error: any) {
    if (error.response) {
      console.log(error.response.status);
      console.log(error.response.data);
    } else {
      console.log(error.message);
    }
  }
}
