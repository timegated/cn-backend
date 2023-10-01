import OpenAI from "openai";
import { Completion } from "openai/resources";
import { Stream } from "openai/streaming";

require('dotenv').config()

export const api = new OpenAI({
  apiKey: process.env.GPT_SECRET
});

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
    const completion = await api.completions.create({
      model: model,
      prompt: `${promptText}, return the response as ${responseAs}`,
      max_tokens: maxTokens,
      n: numResponses,
      temperature: temperature,
      stream: true
    });
    return completion;
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
  msg: any,
  model: string,
  maxTokens: number,
  numResponses?: number,
  temperature?: number,
  responseAs?: string
) {
  try {
    const res = await api.chat.completions.create(
      {
        model: model,
        messages: Array.isArray(msg) ? msg : [msg],
        max_tokens: maxTokens,
        n: 1,
        stream: true,
        presence_penalty: 1,
        temperature: 0,
        frequency_penalty: 1,
      }
    );
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
    const res:Stream<Completion> = await api.completions.create(
      {
        model: model,
        prompt: `${prompt}`,
        max_tokens: maxTokens,
        temperature: 0,
        stream: true,
      }
    );
    return res;
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
  msgs: any,
  model: string,
  maxTokens: number,
) {
  try {
    const res = await api.chat.completions.create(
      {
        model: model,
        messages: msgs && Array.isArray(msgs) ? msgs : [msgs],
        max_tokens: maxTokens,
        n: 1,
        stream: true,
      },
    );
    return res;
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
    const res = await api.models.list({
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
    const createFile = await api.files.create({
      file,
      purpose
    });
    return createFile;
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
    const listFiles = await api.files.list();
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
    const singleFile = await api.files.retrieve(id);
    return singleFile;
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
    const deleteFile = await api.files.del(id);
    return deleteFile;
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
    const fineTune = await api.fineTunes.create({
      training_file: params.id,
    });
    return fineTune;
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
    const retrieve = await api.fineTunes.retrieve(id);
    return retrieve;
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
    const createResponse = await api.embeddings.create({ model: "text-embedding-ada-002", input });

    return createResponse.data;
  } catch (error: any) {
    if (error.response) {
      console.log(error.response.status);
      console.log(error.response.data);
    } else {
      console.log(error.message);
    }
  }
}
