import { Storage } from "@google-cloud/storage";
import * as os from "node:os";
import * as path from "node:path";
import * as fsDefault from "node:fs";
import { BaseDocumentLoader } from "@langchain/core/document_loaders/base";
import { UnstructuredLoader, } from "../fs/unstructured.js";
/**
 * A class that extends the BaseDocumentLoader class. It represents a
 * document loader for loading files from a google cloud storage bucket.
 * @example
 * ```typescript
 * const loader = new GoogleCloudStorageLoader({
 *   bucket: "<my-bucket-name>",
 *   file: "<file-path>",
 *   storageOptions: {
 *     keyFilename: "<key-file-name-path>"
 *   }
 *   unstructuredConfig: {
 *     apiUrl: "<unstructured-API-URL>",
 *     apiKey: "<unstructured-API-key>"
 *   }
 * });
 * const docs = await loader.load();
 * ```
 */
export class GoogleCloudStorageLoader extends BaseDocumentLoader {
    constructor({ fs = fsDefault, file, bucket, unstructuredLoaderOptions, storageOptions, }) {
        super();
        Object.defineProperty(this, "bucket", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "file", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "storageOptions", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_fs", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "unstructuredLoaderOptions", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this._fs = fs;
        this.bucket = bucket;
        this.file = file;
        this.unstructuredLoaderOptions = unstructuredLoaderOptions;
        this.storageOptions = storageOptions;
    }
    async load() {
        const tempDir = this._fs.mkdtempSync(path.join(os.tmpdir(), "googlecloudstoragefileloader-"));
        const filePath = path.join(tempDir, this.file);
        try {
            const storage = new Storage(this.storageOptions);
            const bucket = storage.bucket(this.bucket);
            const [buffer] = await bucket.file(this.file).download();
            this._fs.mkdirSync(path.dirname(filePath), { recursive: true });
            this._fs.writeFileSync(filePath, buffer);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        }
        catch (e) {
            throw new Error(`Failed to download file ${this.file} from google cloud storage bucket ${this.bucket}: ${e.message}`);
        }
        try {
            const unstructuredLoader = new UnstructuredLoader(filePath, this.unstructuredLoaderOptions);
            const docs = await unstructuredLoader.load();
            return docs;
        }
        catch {
            throw new Error(`Failed to load file ${filePath} using unstructured loader.`);
        }
    }
}
