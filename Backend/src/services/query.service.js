import { getGoogleGenAI, getEmbeddings } from '../utils/ai.js';
import { getPineconeClient } from './pinecone.service.js';

const genAI = getGoogleGenAI();
const generativeModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

async function transformQuery(question, history) {
    const chat = generativeModel.startChat({ history });
    const msg = `Based on the chat history, rephrase the following question into a complete, standalone question that can be understood without the history. Only output the rewritten question. Question: "${question}"`;

    const result = await chat.sendMessage(msg);
    const response = await result.response;
    const transformed = response.text().trim();
    console.log(`Transformed query: "${transformed}"`);
    return transformed;
}

export const handleQuery = async (question, history) => {
    try {
        let standaloneQuery = question;

        const isFollowUp = (q) => {
            const lowerCaseQuery = q.toLowerCase();
            const followUpKeywords = ['it', 'that', 'this', 'its', 'tell me more', 'what about'];
            return lowerCaseQuery.split(' ').length <= 4 || followUpKeywords.some(keyword => lowerCaseQuery.includes(keyword));
        };

        let validatedHistory = history || [];
        if (validatedHistory.length > 0 && validatedHistory[0].role !== 'user') {
            const firstUserIndex = validatedHistory.findIndex(msg => msg.role === 'user');
            if (firstUserIndex !== -1) {
                validatedHistory = validatedHistory.slice(firstUserIndex);
            } else {
                validatedHistory = []; 
            }
        }

        if (validatedHistory.length > 0 && isFollowUp(question)) {
            console.log("Follow-up question detected. Rewriting query using history...");
            standaloneQuery = await transformQuery(question, validatedHistory);
        } else {
            console.log("Standalone question detected. Using original query for search.");
        }

        const embeddings = getEmbeddings();
        const queryVector = await embeddings.embedQuery(standaloneQuery);

        const pinecone = getPineconeClient();
        const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME);

        const searchResults = await pineconeIndex.query({
            topK: 5,
            vector: queryVector,
            includeMetadata: true,
        });

        const context = searchResults.matches
            .map(match => match.metadata.text)
            .join("\n\n---\n\n");

        const chat = generativeModel.startChat({ history: validatedHistory });
        const prompt = `You are an expert document analysis assistant.
Your rules:
1. Answer the user's question based ONLY on the provided context.
2. If the answer is not found in the context, state exactly: "I could not find the answer in the provided document."
3. Do not add any information that is not from the context.

Context:
${context}

Question:
${question}`;

        const result = await chat.sendMessage(prompt);
        const response = await result.response;
        const answer = response.text();

        console.log("Generated Answer:", answer);
        return answer;

    } catch (error) {
        console.error("Error handling query:", error);
        throw new Error("Failed to get an answer from the AI model.");
    }
};
