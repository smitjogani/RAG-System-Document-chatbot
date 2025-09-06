"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLlamaModel = createLlamaModel;
exports.createLlamaContext = createLlamaContext;
exports.createLlamaSession = createLlamaSession;
exports.createLlamaJsonSchemaGrammar = createLlamaJsonSchemaGrammar;
exports.createCustomGrammar = createCustomGrammar;
/* eslint-disable import/no-extraneous-dependencies */
const node_llama_cpp_1 = require("node-llama-cpp");
async function createLlamaModel(inputs, llama) {
    const options = {
        gpuLayers: inputs?.gpuLayers,
        modelPath: inputs.modelPath,
        useMlock: inputs?.useMlock,
        useMmap: inputs?.useMmap,
        vocabOnly: inputs?.vocabOnly,
    };
    return llama.loadModel(options);
}
async function createLlamaContext(model, inputs) {
    const options = {
        batchSize: inputs?.batchSize,
        contextSize: inputs?.contextSize,
        threads: inputs?.threads,
    };
    return model.createContext(options);
}
function createLlamaSession(context) {
    return new node_llama_cpp_1.LlamaChatSession({ contextSequence: context.getSequence() });
}
async function createLlamaJsonSchemaGrammar(schemaString, llama) {
    if (schemaString === undefined) {
        return undefined;
    }
    const schemaJSON = schemaString;
    return await llama.createGrammarForJsonSchema(schemaJSON);
}
async function createCustomGrammar(filePath, llama) {
    if (filePath === undefined) {
        return undefined;
    }
    return llama.createGrammar({
        grammar: filePath,
    });
}
