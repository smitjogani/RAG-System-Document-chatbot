import { BaseListChatMessageHistory } from "@langchain/core/chat_history";
import { BaseMessage } from "@langchain/core/messages";
export type Neo4jChatMessageHistoryConfigInput = {
    sessionId?: string | number;
    sessionNodeLabel?: string;
    messageNodeLabel?: string;
    url: string;
    username: string;
    password: string;
    windowSize?: number;
};
export declare class Neo4jChatMessageHistory extends BaseListChatMessageHistory {
    lc_namespace: string[];
    sessionId: string | number;
    sessionNodeLabel: string;
    messageNodeLabel: string;
    windowSize: number;
    private driver;
    constructor({ sessionId, sessionNodeLabel, messageNodeLabel, url, username, password, windowSize, }: Neo4jChatMessageHistoryConfigInput);
    static initialize(props: Neo4jChatMessageHistoryConfigInput): Promise<Neo4jChatMessageHistory>;
    verifyConnectivity(): Promise<import("neo4j-driver-core").ServerInfo>;
    getMessages(): Promise<BaseMessage[]>;
    addMessage(message: BaseMessage): Promise<void>;
    clear(): Promise<void>;
    close(): Promise<void>;
}
