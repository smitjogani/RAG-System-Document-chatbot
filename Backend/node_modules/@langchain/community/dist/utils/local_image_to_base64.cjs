"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.localImageToBase64 = localImageToBase64;
const node_buffer_1 = require("node:buffer");
const promises_1 = __importDefault(require("node:fs/promises"));
async function localImageToBase64(filePath) {
    const data = await promises_1.default.readFile(filePath);
    return node_buffer_1.Buffer.from(data).toString("base64");
}
