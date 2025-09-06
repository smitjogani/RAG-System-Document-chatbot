"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const openai_1 = require("@langchain/openai");
const documents_1 = require("@langchain/core/documents");
const llm_js_1 = require("./llm.cjs");
const document_js_1 = require("../../graphs/document.cjs");
test.skip("convertToGraphDocuments", async () => {
    const model = new openai_1.ChatOpenAI({
        temperature: 0,
        model: "gpt-4o-mini",
    });
    const llmGraphTransformer = new llm_js_1.LLMGraphTransformer({
        llm: model,
    });
    // @eslint-disable-next-line/@typescript-eslint/ban-ts-comment
    // @ts-expect-error unused var
    const result = await llmGraphTransformer.convertToGraphDocuments([
        new documents_1.Document({ pageContent: "Elon Musk is suing OpenAI" }),
    ]);
});
test("convertToGraphDocuments with allowed", async () => {
    const model = new openai_1.ChatOpenAI({
        temperature: 0,
        model: "gpt-4o-mini",
    });
    const llmGraphTransformer = new llm_js_1.LLMGraphTransformer({
        llm: model,
        allowedNodes: ["PERSON", "ORGANIZATION"],
        allowedRelationships: ["SUES"],
    });
    const result = await llmGraphTransformer.convertToGraphDocuments([
        new documents_1.Document({ pageContent: "Elon Musk is suing OpenAI" }),
    ]);
    expect(result).toEqual([
        new document_js_1.GraphDocument({
            nodes: [
                new document_js_1.Node({ id: "Elon Musk", type: "Person" }),
                new document_js_1.Node({ id: "OpenAI", type: "Organization" }),
            ],
            relationships: [
                new document_js_1.Relationship({
                    source: new document_js_1.Node({ id: "Elon Musk", type: "Person" }),
                    target: new document_js_1.Node({ id: "OpenAI", type: "Organization" }),
                    type: "SUES",
                }),
            ],
            source: new documents_1.Document({
                pageContent: "Elon Musk is suing OpenAI",
                metadata: {},
            }),
        }),
    ]);
});
test("convertToGraphDocuments with allowed lowercased", async () => {
    const model = new openai_1.ChatOpenAI({
        temperature: 0,
        model: "gpt-4o-mini",
    });
    const llmGraphTransformer = new llm_js_1.LLMGraphTransformer({
        llm: model,
        allowedNodes: ["Person", "Organization"],
        allowedRelationships: ["SUES"],
    });
    const result = await llmGraphTransformer.convertToGraphDocuments([
        new documents_1.Document({ pageContent: "Elon Musk is suing OpenAI" }),
    ]);
    expect(result).toEqual([
        new document_js_1.GraphDocument({
            nodes: [
                new document_js_1.Node({ id: "Elon Musk", type: "Person" }),
                new document_js_1.Node({ id: "OpenAI", type: "Organization" }),
            ],
            relationships: [
                new document_js_1.Relationship({
                    source: new document_js_1.Node({ id: "Elon Musk", type: "Person" }),
                    target: new document_js_1.Node({ id: "OpenAI", type: "Organization" }),
                    type: "SUES",
                }),
            ],
            source: new documents_1.Document({
                pageContent: "Elon Musk is suing OpenAI",
                metadata: {},
            }),
        }),
    ]);
});
test("convertToGraphDocuments with node properties", async () => {
    const model = new openai_1.ChatOpenAI({
        temperature: 0,
        model: "gpt-4o-mini",
    });
    const llmGraphTransformer = new llm_js_1.LLMGraphTransformer({
        llm: model,
        allowedNodes: ["Person"],
        allowedRelationships: ["KNOWS"],
        nodeProperties: ["age", "country"],
    });
    const result = await llmGraphTransformer.convertToGraphDocuments([
        new documents_1.Document({ pageContent: "John is 30 years old and lives in Spain" }),
    ]);
    expect(result).toEqual([
        new document_js_1.GraphDocument({
            nodes: [
                new document_js_1.Node({
                    id: "John",
                    type: "Person",
                    properties: {
                        age: "30",
                        country: "Spain",
                    },
                }),
            ],
            relationships: [],
            source: new documents_1.Document({
                pageContent: "John is 30 years old and lives in Spain",
                metadata: {},
            }),
        }),
    ]);
});
test("convertToGraphDocuments with relationship properties", async () => {
    const model = new openai_1.ChatOpenAI({
        temperature: 0,
        model: "gpt-4o-mini",
    });
    const llmGraphTransformer = new llm_js_1.LLMGraphTransformer({
        llm: model,
        allowedNodes: ["Person"],
        allowedRelationships: ["KNOWS"],
        relationshipProperties: ["since"],
    });
    const result = await llmGraphTransformer.convertToGraphDocuments([
        new documents_1.Document({ pageContent: "John has known Mary since 2020" }),
    ]);
    expect(result).toEqual([
        new document_js_1.GraphDocument({
            nodes: [
                new document_js_1.Node({ id: "John", type: "Person" }),
                new document_js_1.Node({ id: "Mary", type: "Person" }),
            ],
            relationships: [
                new document_js_1.Relationship({
                    source: new document_js_1.Node({ id: "John", type: "Person" }),
                    target: new document_js_1.Node({ id: "Mary", type: "Person" }),
                    type: "KNOWS",
                    properties: {
                        since: "2020",
                    },
                }),
            ],
            source: new documents_1.Document({
                pageContent: "John has known Mary since 2020",
                metadata: {},
            }),
        }),
    ]);
});
