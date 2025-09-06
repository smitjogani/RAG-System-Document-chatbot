# DocuMind — RAG Proof of Concept

DocuMind is a compact, production-minded Retrieval-Augmented Generation (RAG) proof-of-concept for chatting with documents (PDF & JSON). It includes a Node.js backend (LangChain helpers + Pinecone) and a React frontend (Vite) for uploading documents, indexing them as vectors, and running context-constrained Q&A using Google Gemini.

---

## Highlights

- Upload PDF and JSON documents (special handling for `gov.scheme.json`).
- Chunk documents and create embeddings (Google Generative AI / Gemini).
- Store vectors in Pinecone and run semantic search.
- Query rewriting for follow-ups and context-constrained answers.
- Modular backend services (pdf loader, splitter, embeddings, pinecone, ai) and a small React UI for upload + chat.

---

## Repository layout (relevant folders)

```
POC/
├─ client/                 # React (Vite) SPA (upload + chat)
├─ Backend/                # Legacy versions (version1..version5). Use `version5` as the latest backend POC
│  └─ version5/
│     ├─ server.js
│     └─ src/
│        ├─ services/      # document/pinecone/query services
│        └─ utils/         # ai (embeddings + client) helpers
└─ README.md               # <-- you are here
```

Use `Backend/version5` for the latest backend implementation and `client/` for the frontend.

---

## Tech Stack

- Backend: Node.js (ESM), Express, LangChain helpers, Google Gemini (Google Generative AI), Pinecone SDK
- Frontend: React, Vite
- Storage: Pinecone vector DB
- Configuration: `.env` files

---

## Quickstart (local)

Prerequisites

- Node.js 18+ (or current LTS), npm
- A Google credentials/API key for Gemini embeddings
- Pinecone API key and an index created with the correct `dimension`

1. Backend (latest - `version5`)

```bash
cd Backend/version5
npm install
# Start the server
node server.js
# or, if you have nodemon
npx nodemon server.js
```

2. Frontend

```bash
cd client
npm install
npm run dev
```

Open the app in your browser (Vite usually runs at `http://localhost:5173`). Backend runs at `http://localhost:3000` by default in the POC.

---

## Environment variables

Create a `.env` file in `Backend/version5` and set at minimum:

```
GEMINI_API_KEY=your_gemini_api_key_here
PINECONE_API_KEY=your_pinecone_api_key_here
PINECONE_ENV=your_pinecone_env_here
PINECONE_INDEX_NAME=your_index_name_here
PINECONE_INDEX_DIM=1024
PORT=3000
```

Notes

- `GEMINI_API_KEY`: used by the Google Generative AI client for embeddings and LLM calls. If you use a service account or a different auth method, adapt `src/utils/ai.js` accordingly.
- `PINECONE_INDEX_DIM` is optional but recommended so the backend can validate embedding dimensions before upserting.

---

## Indexing flow (what happens when you upload)

1. File received by backend upload endpoint (PDF or `.json`).
2. Text extraction and chunking (RecursiveCharacterTextSplitter).
3. Embeddings generated via Google Generative AI (Gemini text-embedding-004).
4. Vector upsert to Pinecone (index name from `PINECONE_INDEX_NAME`).

The code performs validation so empty or mismatched-dimensional vectors are rejected before being sent to Pinecone.

---

## Common issues & troubleshooting

1. Generative Language API disabled / 403 SERVICE_DISABLED

Symptom:

```
GoogleGenerativeAIFetchError: ... Generative Language API has not been used in project ... or it is disabled. Enable it by visiting https://console.developers.google.com/apis/api/generativelanguage.googleapis.com/overview?project=YOUR_PROJECT_ID
```

Fix:

- Open the provided activation URL in the error and enable the **Generative Language API** for the Google Cloud project linked to your key.
- Wait a few minutes after enabling and retry.
- Ensure `GEMINI_API_KEY` is pointing to the same project credentials.

2. Pinecone dimension mismatch: `Vector dimension 0 does not match the dimension of the index 1024`

Symptom:

- Embeddings returned empty arrays or a vector length that doesn't match the Pinecone index dimension.

Fix:

- Confirm `PINECONE_INDEX_NAME` and open the Pinecone console to verify the index `dimension`.
- Set `PINECONE_INDEX_DIM` in `.env` to the index dimension for local validation.
- Ensure embeddings are non-empty before upserting (the repo includes validation).
- If needed, recreate the Pinecone index with the matching dimension or switch to an embedding model that returns the required size.

3. Other tips

- If embedding calls fail repeatedly, check network, API key, and that billing/quotas are enabled for the Google project.
- To reduce risk, consider adding provider fallback (OpenAI embeddings) or a local embedding service.

---

## Development notes & extension ideas

- Provider fallback: add `EMBEDDINGS_PROVIDER` env flag and implement OpenAI or local fallback.
- Batch upserts: switch from `PineconeStore.fromDocuments` to a manual embed → validate → `pineconeIndex.upsert()` flow for per-vector error handling.
- Streaming responses: update LLM calls to use streaming where supported so the UI can show progressive answers.

---

## Contributing

- Open issues for bugs or feature requests.
- Send PRs to the appropriate `versionX` folder with clear scope — `version5` is the current target for improvements.

---

## License

This project is provided as-is for demonstration. Add a proper `LICENSE` file to apply an open-source license.

---

If you'd like, I can also:

- add a project-level `package.json` and `start` script that boots both backend and frontend together for easier local demos,
- add a `README` inside `Backend/version5` that documents the server APIs and expected request/response shapes,
- or create a short GIF demo and text snippet for LinkedIn.

Tell me which one you'd like next.
