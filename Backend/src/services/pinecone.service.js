import { Pinecone } from '@pinecone-database/pinecone';
import * as dotenv from 'dotenv';
dotenv.config();

let pineconeClient = null;

const getPineconeClient = () => {
    if (!pineconeClient) {
        pineconeClient = new Pinecone({
            apiKey: process.env.PINECONE_API_KEY,
        });
        console.log("Pinecone client initialized.");
    }
    return pineconeClient;
};

export { getPineconeClient };