import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import * as dotenv from 'dotenv';
dotenv.config();

let genAIInstance = null;
let embeddingsInstance = null;

export const getGoogleGenAI = () => {
    if (!genAIInstance) {
        genAIInstance = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        console.log("GoogleGenerativeAI client initialized.");
    }
    return genAIInstance;
};

export const getEmbeddings = () => {
    if (!embeddingsInstance) {
        embeddingsInstance = new GoogleGenerativeAIEmbeddings({
            apiKey: process.env.GEMINI_API_KEY,
            model: 'text-embedding-004',
        });
        console.log("GoogleGenerativeAIEmbeddings initialized.");
    }
    return embeddingsInstance;
};
