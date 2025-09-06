import { KVMap } from "../schemas.js";
export declare function extractOutputTokenDetails(reasoningTokens?: number): Record<string, number>;
export declare function extractInputTokenDetails(providerMetadata: Record<string, unknown>, cachedTokenUsage?: number): Record<string, number>;
export declare function extractUsageMetadata(span?: {
    status?: {
        code: number;
    };
    attributes?: Record<string, unknown>;
}): KVMap;
