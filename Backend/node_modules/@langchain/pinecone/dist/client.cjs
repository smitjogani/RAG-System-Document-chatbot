"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPineconeClient = void 0;
const pinecone_1 = require("@pinecone-database/pinecone");
const env_1 = require("@langchain/core/utils/env");
function getPineconeClient(config) {
    if ((0, env_1.getEnvironmentVariable)("PINECONE_API_KEY") === undefined ||
        (0, env_1.getEnvironmentVariable)("PINECONE_API_KEY") === "") {
        throw new Error("PINECONE_API_KEY must be set in environment");
    }
    if (!config) {
        return new pinecone_1.Pinecone();
    }
    else {
        return new pinecone_1.Pinecone(config);
    }
}
exports.getPineconeClient = getPineconeClient;
