import * as dotenv from 'dotenv';
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

async function runTest() {
    console.log("\n--- Starting Gemini Embedding Test ---\n");

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("ERROR: GEMINI_API_KEY not found in .env file.");
        return;
    }
    console.log("API Key found in .env file.");

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "text-embedding-004" });

        console.log("Attempting to embed 'Hello world'...");

        const result = await model.embedContent("Hello world");
        const embedding = result.embedding;

        if (embedding && embedding.values) {
            console.log("SUCCESS! Embedding created successfully.");
            console.log(`Vector Dimension: ${embedding.values.length}`);
            if (embedding.values.length === 768) {
                console.log("Dimension is 768, which correctly matches your Pinecone index.");
            } else {
                console.error(`WARNING: Dimension is ${embedding.values.length}, but your Pinecone index expects 768.`);
            }
        } else {
            console.error("ERROR: Embedding process failed. The result did not contain a valid embedding.");
        }

    } catch (error) {
        console.error("ERROR: An error occurred while trying to create the embedding.");
        console.error("This almost always means there is an issue with your API Key or Google Cloud Project setup.");
        console.error("\n--- Full Error Details ---");
        console.error(error);
        console.error("--------------------------");
    } finally {
        console.log("\n--- Test Finished ---\n");
    }
}

runTest();