import neo4j, { auth } from "neo4j-driver";
import { v4 as uuidv4 } from "uuid";
import { BaseListChatMessageHistory } from "@langchain/core/chat_history";
import { mapStoredMessagesToChatMessages, } from "@langchain/core/messages";
const defaultConfig = {
    sessionNodeLabel: "ChatSession",
    messageNodeLabel: "ChatMessage",
    windowSize: 3,
};
export class Neo4jChatMessageHistory extends BaseListChatMessageHistory {
    constructor({ sessionId = uuidv4(), sessionNodeLabel = defaultConfig.sessionNodeLabel, messageNodeLabel = defaultConfig.messageNodeLabel, url, username, password, windowSize = defaultConfig.windowSize, }) {
        super();
        Object.defineProperty(this, "lc_namespace", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ["langchain", "stores", "message", "neo4j"]
        });
        Object.defineProperty(this, "sessionId", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "sessionNodeLabel", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "messageNodeLabel", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "windowSize", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "driver", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.sessionId = sessionId;
        this.sessionNodeLabel = sessionNodeLabel;
        this.messageNodeLabel = messageNodeLabel;
        this.windowSize = windowSize;
        if (url && username && password) {
            try {
                this.driver = neo4j.driver(url, auth.basic(username, password));
            }
            catch (e) {
                throw new Error(`Could not create a Neo4j driver instance. Please check the connection details.\nCause: ${e.message}`);
            }
        }
        else {
            throw new Error("Neo4j connection details not provided.");
        }
    }
    static async initialize(props) {
        const instance = new Neo4jChatMessageHistory(props);
        try {
            await instance.verifyConnectivity();
        }
        catch (e) {
            throw new Error(`Could not verify connection to the Neo4j database.\nCause: ${e.message}`);
        }
        return instance;
    }
    async verifyConnectivity() {
        const connectivity = await this.driver.getServerInfo();
        return connectivity;
    }
    async getMessages() {
        const getMessagesCypherQuery = `
      MERGE (chatSession:${this.sessionNodeLabel} {id: $sessionId})
      WITH chatSession
      MATCH (chatSession)-[:LAST_MESSAGE]->(lastMessage)
      MATCH p=(lastMessage)<-[:NEXT*0..${this.windowSize * 2 - 1}]-()
      WITH p, length(p) AS length
      ORDER BY length DESC LIMIT 1
      UNWIND reverse(nodes(p)) AS node
      RETURN {data:{content: node.content}, type:node.type} AS result
    `;
        try {
            const { records } = await this.driver.executeQuery(getMessagesCypherQuery, {
                sessionId: this.sessionId,
            });
            const results = records.map((record) => record.get("result"));
            return mapStoredMessagesToChatMessages(results);
        }
        catch (e) {
            throw new Error(`Ohno! Couldn't get messages.\nCause: ${e.message}`);
        }
    }
    async addMessage(message) {
        const addMessageCypherQuery = `
      MERGE (chatSession:${this.sessionNodeLabel} {id: $sessionId})
      WITH chatSession
      OPTIONAL MATCH (chatSession)-[lastMessageRel:LAST_MESSAGE]->(lastMessage)
      CREATE (chatSession)-[:LAST_MESSAGE]->(newLastMessage:${this.messageNodeLabel})
      SET newLastMessage += {type:$type, content:$content}
      WITH newLastMessage, lastMessageRel, lastMessage
      WHERE lastMessage IS NOT NULL
      CREATE (lastMessage)-[:NEXT]->(newLastMessage)
      DELETE lastMessageRel
    `;
        try {
            await this.driver.executeQuery(addMessageCypherQuery, {
                sessionId: this.sessionId,
                type: message.getType(),
                content: message.content,
            });
        }
        catch (e) {
            throw new Error(`Ohno! Couldn't add message.\nCause: ${e.message}`);
        }
    }
    async clear() {
        const clearMessagesCypherQuery = `
      MATCH p=(chatSession:${this.sessionNodeLabel} {id: $sessionId})-[:LAST_MESSAGE]->(lastMessage)<-[:NEXT*0..]-()
      UNWIND nodes(p) as node
      DETACH DELETE node
    `;
        try {
            await this.driver.executeQuery(clearMessagesCypherQuery, {
                sessionId: this.sessionId,
            });
        }
        catch (e) {
            throw new Error(`Ohno! Couldn't clear chat history.\nCause: ${e.message}`);
        }
    }
    async close() {
        await this.driver.close();
    }
}
