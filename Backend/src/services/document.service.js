import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { Document } from '@langchain/core/documents';
import { PineconeStore } from '@langchain/pinecone';
import { getPineconeClient } from './pinecone.service.js';
import { getEmbeddings } from '../utils/ai.js';
import fs from 'fs/promises';
import path from 'path';

export const processAndIndexDocument = async (file) => {
    const { path: filePath, originalname: fileName } = file;
    let rawDocs = [];
    const fileExtension = path.extname(fileName).toLowerCase();

    console.log(`Processing file: ${fileName}`);

    try {
        // Load document based on file type
        if (fileExtension === '.pdf') {
            const fileData = await fs.readFile(filePath);
            const blob = new Blob([fileData]);
            const loader = new PDFLoader(blob);
            rawDocs = await loader.load();
            console.log(`- Loaded PDF: ${fileName}`);
        } else if (fileExtension === '.json') {
            if (fileName.toLowerCase() === 'gov.scheme.json') {
                const jsonContent = await fs.readFile(filePath, 'utf8');
                const jsonData = JSON.parse(jsonContent);

                for (const scheme of jsonData.government_schemes) {
                    let content = `Scheme Name: ${scheme.name}\n`;
                    if (scheme.full_name) content += `Full Name: ${scheme.full_name}\n`;
                    content += `Category: ${scheme.category}\n`;
                    content += `Launched Year: ${scheme.launched_year}\n`;
                    content += `Description: ${scheme.description}\n`;
                    if (scheme.annual_premium) content += `Annual Premium: ${scheme.annual_premium}\n`;
                    if (scheme.budget_allocation) content += `Budget Allocation: ${scheme.budget_allocation}\n`;
                    content += `Implementing Ministry: ${scheme.implementing_ministry}`;

                    const doc = new Document({
                        pageContent: content,
                        metadata: { source: fileName, scheme_name: scheme.name }
                    });
                    rawDocs.push(doc);
                }
                console.log(`- Loaded and processed structured JSON: ${fileName}`);
            } else {
                console.log(`- Attempting to load a generic JSON file: ${fileName}`);
                const jsonContent = await fs.readFile(filePath, 'utf8');
                const jsonData = JSON.parse(jsonContent);
                const doc = new Document({ pageContent: JSON.stringify(jsonData), metadata: { source: fileName } });
                rawDocs.push(doc);
            }
        } else {
            throw new Error(`Unsupported file type: ${fileExtension}`);
        }

        if (rawDocs.length === 0) {
            console.warn("Warning: No content was extracted from the document.");
            return;
        }

        // Split the document content into chunks for indexing
        const textSplitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1000,
            chunkOverlap: 200,
        });
        const chunkedDocs = await textSplitter.splitDocuments(rawDocs);
        console.log(`Document split into ${chunkedDocs.length} chunks.`);

        // Validate the embeddings
        const embeddings = getEmbeddings();
        const pinecone = getPineconeClient();
        const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME);

        try {
            const sampleText = chunkedDocs[0]?.pageContent ?? chunkedDocs[0]?.metadata?.text ?? '';
            if (!sampleText) {
                throw new Error('No sample text available to validate embeddings.');
            }

            const sampleVector = await embeddings.embedQuery(sampleText);

            if (!Array.isArray(sampleVector) || sampleVector.length === 0) {
                throw new Error('Embedding model returned an empty vector. Check your GEMINI_API_KEY or ensure the Generative Language API is enabled.');
            }

            // Optional: enforce expected vector dimension from .env
            const expectedDim = process.env.PINECONE_INDEX_DIM ? Number(process.env.PINECONE_INDEX_DIM) : null;
            if (expectedDim && sampleVector.length !== expectedDim) {
                throw new Error(`Embedding dimension mismatch: embedding returned ${sampleVector.length} but index expects ${expectedDim}. Either recreate the Pinecone index to match the embedding size, or use an embedding model that matches the index.`);
            }

            console.log(`Embedding check OK — sample vector length: ${sampleVector.length}${expectedDim ? ` (expected ${expectedDim})` : ''}`);
        } catch (validationErr) {
            console.error('Embedding validation failed:', validationErr.message || validationErr);
            throw validationErr; // Abort before attempting to upsert to Pinecone
        }

        // Store the document chunks in Pinecone
        console.log("Storing document chunks in Pinecone...");
        await PineconeStore.fromDocuments(chunkedDocs, embeddings, {
            pineconeIndex,
            maxConcurrency: 5,
        });
        console.log("Data stored successfully in Pinecone.");

    } catch (error) {
        console.error("Error during document processing:", error);
        throw error;
    } finally {
        try {
            await fs.unlink(filePath);
            console.log(`Cleaned up temporary file: ${filePath}`);
        } catch (cleanupError) {
            console.error("Error cleaning up temporary file:", cleanupError);
        }
    }
};
