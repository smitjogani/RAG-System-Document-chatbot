import { kv } from "@vercel/kv";
import { BaseCache, deserializeStoredGeneration, getCacheKey, serializeGeneration, } from "@langchain/core/caches";
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
export class VercelKVCache extends BaseCache {
    constructor(props) {
        super();
        Object.defineProperty(this, "client", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "ttl", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        const { client, ttl } = props;
        this.client = client ?? kv;
        this.ttl = ttl;
    }
    /**
     * Lookup LLM generations in cache by prompt and associated LLM key.
     */
    async lookup(prompt, llmKey) {
        let idx = 0;
        let key = getCacheKey(prompt, llmKey, String(idx));
        let value = await this.client.get(key);
        const generations = [];
        while (value) {
            generations.push(deserializeStoredGeneration(value));
            idx += 1;
            key = getCacheKey(prompt, llmKey, String(idx));
            value = await this.client.get(key);
        }
        return generations.length > 0 ? generations : null;
    }
    /**
     * Update the cache with the given generations.
     *
     * Note this overwrites any existing generations for the given prompt and LLM key.
     */
    async update(prompt, llmKey, value) {
        for (let i = 0; i < value.length; i += 1) {
            const key = getCacheKey(prompt, llmKey, String(i));
            const serializedValue = JSON.stringify(serializeGeneration(value[i]));
            if (this.ttl) {
                await this.client.set(key, serializedValue, { ex: this.ttl });
            }
            else {
                await this.client.set(key, serializedValue);
            }
        }
    }
}
