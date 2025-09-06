/* eslint-disable import/no-extraneous-dependencies */
import { LlamaChatSession, } from "node-llama-cpp";
export async function createLlamaModel(inputs, llama) {
    const options = {
        gpuLayers: inputs?.gpuLayers,
        modelPath: inputs.modelPath,
        useMlock: inputs?.useMlock,
        useMmap: inputs?.useMmap,
        vocabOnly: inputs?.vocabOnly,
    };
    return llama.loadModel(options);
}
export async function createLlamaContext(model, inputs) {
    const options = {
        batchSize: inputs?.batchSize,
        contextSize: inputs?.contextSize,
        threads: inputs?.threads,
    };
    return model.createContext(options);
}
export function createLlamaSession(context) {
    return new LlamaChatSession({ contextSequence: context.getSequence() });
}
export async function createLlamaJsonSchemaGrammar(schemaString, llama) {
    if (schemaString === undefined) {
        return undefined;
    }
    const schemaJSON = schemaString;
    return await llama.createGrammarForJsonSchema(schemaJSON);
}
export async function createCustomGrammar(filePath, llama) {
    if (filePath === undefined) {
        return undefined;
    }
    return llama.createGrammar({
        grammar: filePath,
    });
}
