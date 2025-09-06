import { type VercelKV } from "@vercel/kv";
import { Generation } from "@langchain/core/outputs";
import { BaseCache } from "@langchain/core/caches";
export type VercelKVCacheProps = {
    /**
     * An existing Vercel KV client
     */
    client?: VercelKV;
    /**
     * Time-to-live (TTL) for cached items in seconds
     */
    ttl?: number;
};
/**
 * A cache that uses Vercel KV as the backing store.
 * @example
 * ```typescript
 * const cache = new VercelKVCache({
 *   ttl: 3600, // Optional: Cache entries will expire after 1 hour
 * });
 *
 * // Initialize the OpenAI model with Vercel KV cache for caching responses
 * const model = new ChatOpenAI({
 *   model: "gpt-4o-mini",
 *   cache,
 * });
 * await model.invoke("How are you today?");
 * const cachedValues = await cache.lookup("How are you today?", "llmKey");
 * ```
 */
export declare class VercelKVCache extends BaseCache {
    private client;
    private ttl?;
    constructor(props: VercelKVCacheProps);
    /**
     * Lookup LLM generations in cache by prompt and associated LLM key.
     */
    lookup(prompt: string, llmKey: string): Promise<Generation[] | null>;
    /**
     * Update the cache with the given generations.
     *
     * Note this overwrites any existing generations for the given prompt and LLM key.
     */
    update(prompt: string, llmKey: string, value: Generation[]): Promise<void>;
}
