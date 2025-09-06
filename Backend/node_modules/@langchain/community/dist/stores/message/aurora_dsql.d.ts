import { BaseListChatMessageHistory } from "@langchain/core/chat_history";
import { BaseMessage } from "@langchain/core/messages";
import pg from "pg";
/**
 * Type definition for the input parameters required when instantiating a
 * AuroraDsqlChatMessageHistory object.
 */
export type AuroraDsqlChatMessageHistoryInput = {
    /**
     * Name of the table to use when storing and retrieving chat message
     */
    tableName?: string;
    /**
     * Session ID to use when storing and retrieving chat message history.
     */
    sessionId: string;
    /**
     * Configuration object for the Postgres pool. If provided the
     * AuroraDsqlChatMessageHistory object will create a new pool using
     * the provided configuration. Otherwise it will use the provided
     * pool.
     */
    poolConfig?: pg.PoolConfig;
    /**
     * Postgres pool to use. If provided the PostgresChatMessageHistory
     * object will use the provided pool. Otherwise it will create a
     * new pool using the provided configuration.
     */
    pool?: pg.Pool;
    /**
     * If true, the table name will be escaped. ('lAnGcHaIn' will be escaped to '"lAnGcHaIn"')
     */
    escapeTableName?: boolean;
};
export interface StoredAuroraDsqlMessageData {
    name: string | undefined;
    role: string | undefined;
    content: string;
    additional_kwargs?: Record<string, unknown>;
    type: string;
    tool_call_id: string | undefined;
}
/**
 * Class for managing chat message history using a Amazon Aurora DSQL Database as a
 * storage backend. Extends the BaseListChatMessageHistory class.
 * @example
 * ```typescript
 * const chatHistory = new AuroraDsqlChatMessageHistory({
 *    tableName: "langchain_chat_histories",
 *    sessionId: "lc-example",
 *    pool: new pg.Pool({
 *      host: "your_dsql_endpoint",
 *      port: 5432,
 *      user: "admin",
 *      password: "your_token",
 *      database: "postgres",
 *      ssl: true
 *    }),
 * });
 * ```
 */
export declare class AuroraDsqlChatMessageHistory extends BaseListChatMessageHistory {
    lc_namespace: string[];
    pool: pg.Pool;
    tableName: string;
    sessionId: string;
    private initialized;
    /**
     * Creates a new AuroraDsqlChatMessageHistory.
     * @param {AuroraDsqlChatMessageHistoryInput} fields The input fields for the AuroraDsqlChatMessageHistory.
     * @param {string} fields.tableName The name of the table name to use. Defaults to `langchain_chat_histories`.
     * @param {string} fields.sessionId The session ID to use when storing and retrieving chat message history.
     * @param {pg.Pool} fields.pool The Postgres pool to use. If provided, the AuroraDsqlChatMessageHistory will use the provided pool.
     * @param {pg.PoolConfig} fields.poolConfig The configuration object for the Postgres pool. If no pool is provided, the config will be used to create a new pool.
     * If `pool` is provided, it will be used as the Postgres pool even if `poolConfig` is also provided.
     * @throws If neither `pool` nor `poolConfig` is provided.
     */
    constructor(fields: AuroraDsqlChatMessageHistoryInput);
    /**
     * Checks if the table has been created and creates it if it hasn't.
     * @returns Promise that resolves when the table's existence is ensured.
     */
    private ensureTable;
    private createIndex;
    addMessage(message: BaseMessage): Promise<void>;
    getMessages(): Promise<BaseMessage[]>;
    clear(): Promise<void>;
    /**
     * End the Postgres pool.
     */
    end(): Promise<void>;
}
