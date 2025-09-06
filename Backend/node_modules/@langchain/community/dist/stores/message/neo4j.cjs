"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Neo4jChatMessageHistory = void 0;
const neo4j_driver_1 = __importStar(require("neo4j-driver"));
const uuid_1 = require("uuid");
const chat_history_1 = require("@langchain/core/chat_history");
const messages_1 = require("@langchain/core/messages");
const defaultConfig = {
    sessionNodeLabel: "ChatSession",
    messageNodeLabel: "ChatMessage",
    windowSize: 3,
};
class Neo4jChatMessageHistory extends chat_history_1.BaseListChatMessageHistory {
    constructor({ sessionId = (0, uuid_1.v4)(), sessionNodeLabel = defaultConfig.sessionNodeLabel, messageNodeLabel = defaultConfig.messageNodeLabel, url, username, password, windowSize = defaultConfig.windowSize, }) {
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
                this.driver = neo4j_driver_1.default.driver(url, neo4j_driver_1.auth.basic(username, password));
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
            return (0, messages_1.mapStoredMessagesToChatMessages)(results);
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
exports.Neo4jChatMessageHistory = Neo4jChatMessageHistory;
