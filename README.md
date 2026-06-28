# Agentic AI Humanizer Studio

This is a local Node.js application that rewrites AI-generated text to make it sound more natural and human-like. It uses an agentic LangGraph workflow running Hugging Face Serverless Inference, integrated with a local Model Context Protocol (MCP) server.

For a detailed technical analysis of the execution lifecycle, loops, and design patterns, please refer to the [Architectural Blueprint & Technical Breakdown](./architectural_breakdown.md).

---

## Key Features

*   **Agentic LangGraph Workflow:** Implements a structured multi-agent StateGraph (Profiler, Paraphraser, and Critic) that iteratively refines and evaluates text.
*   **Hugging Face Serverless Inference:** Integrates Qwen/Qwen2.5-7B-Instruct and Llama-3-8B-Instruct models via conversational task endpoints to evaluate and rewrite drafts.
*   **Model Context Protocol (MCP) Integration:** Communicates with a local MCP server over stdio to dynamically retrieve pattern replacements in real time.
*   **Terminal GUI Dashboard:** Serves an interactive monospaced retro-terminal interface to submit and copy text.
*   **Pure JavaScript ESM Architecture:** Built entirely on vanilla Node.js ES Modules, eliminating compilation latency and TypeScript configuration overhead.

---

## Prerequisites
*   **Node.js:** version 20.6.0 or higher (required for native environment file loading).

---

## Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone <repo-url>
    cd agentic-humanizer
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure the API Token:**
    Create a `.env` file in the root directory and add your Hugging Face Access Token:
    ```env
    HUGGINGFACEHUB_API_TOKEN=your_huggingface_access_token_here
    ```

---

## Running the Application

### Launching the GUI Server
To run the interactive web interface (which defaults to port 3000):
```bash
npm start
```
Open `http://localhost:3000` in your web browser.

### Verifying the Workflow
You can run the end-to-end multi-agent workflow test script:
```bash
node <appDataDir>/brain/8156f080-dd40-422c-a7e6-332b51c95fdd/scratch/test-workflow.js
```
This executes the full loop (Profiler -> Paraphraser -> Critic validation -> loop correction -> approval) and prints the status logs directly to the terminal.

---

## Model Context Protocol (MCP) Server

The project includes a built-in MCP server that implements a tool to retrieve replacement patterns.

*   **Location:** [mcp-server/index.js](file:///workspaces/agentic-humanizer/mcp-server/index.js)
*   **Execution Command:** `node mcp-server/index.js`
*   **Tool Name:** `get_humanizer_patterns`
    *   **Arguments:** `{"tone": "casual" | "formal" | "balanced"}` (Strict Zod validation)

---

## Local HTTP Router API

The GUI server also exposes local HTTP endpoints:

*   `GET /health` -> Returns `{ "ok": true }`
*   `POST /api/humanize` -> Invokes the compiled StateGraph workflow and returns the final draft text.

Example API request:
```bash
curl -s -X POST http://localhost:3000/api/humanize \
  -H 'Content-Type: application/json' \
  --data '{"text":"In order to delve into the testament of moreover, we should write simple code."}'
```

Response format:
```json
{
  "result": "explore the testament of also, we should write simple code.",
  "humanizedText": "explore the testament of also, we should write simple code.",
  "changes": ["Agentic workflow rephrasing applied"],
  "proMode": true
}
```

---

## Docker Deployment
The service is configured for single-stage Docker runtimes:
*   **Build command:** `docker build -t agentic-humanizer .`
*   **Execution command:** `docker run -p 3000:3000 -e HUGGINGFACEHUB_API_TOKEN="<your_token>" agentic-humanizer`
