# Agentic AI Humanizer Studio
---
A Node.js ES6 application that rewrites AI-generated text into more natural, human-like writing. It employs an agentic LangGraph workflow running Hugging Face Serverless Inference, integrated with a local Model Context Protocol (MCP) server.

For a detailed technical analysis of the execution lifecycle, loops, and design patterns, read the [Architectural Blueprint & Technical Breakdown](./architectural_breakdown.md).

---

## 🚀 Key Features

- 🤖 **Agentic LangGraph Workflow** - Runs a structured multi-agent state graph (`Profiler` $\rightarrow$ `Paraphraser` $\rightarrow$ `Critic`) to iteratively refine, paraphrase, and review the text.
- ⚡ **Hugging Face Serverless Inference** - Integrates `Qwen/Qwen2.5-7B-Instruct` and `meta-llama/Meta-Llama-3-8B-Instruct` via conversational task endpoints to evaluate and rewrite drafts.
- 🔌 **Model Context Protocol (MCP) Integration** - Queries a local MCP patterns server to dynamically inject pattern replacements in real time.
- 🖥️ **Retro-Terminal GUI** - A monospaced CRT scanline terminal dashboard serving an interactive rephrasing studio.
- 🔀 **Pure JavaScript ESM Architecture** - Built on vanilla Node.js ESModules with no build compilation steps or TypeScript overhead.

---

## 🛠️ Prerequisites
- **Node.js:** >= 20.6.0 (supports native `.env` loading).

---

## 📦 Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd agentic-humanizer
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure API Token:**
   Create a `.env` file in the root directory and add your Hugging Face Access Token:
   ```env
   HUGGINGFACEHUB_API_TOKEN=your_huggingface_access_token_here
   ```

---

## ⚡ Running the App

### 1. Launch the GUI Server
To run the interactive web interface (defaults to port `3000`):
```bash
npm start
```
Open `http://localhost:3000` in your web browser.

### 2. Verify the Workflow
You can run the end-to-end multi-agent workflow test script:
```bash
node <appDataDir>/brain/8156f080-dd40-422c-a7e6-332b51c95fdd/scratch/test-workflow.js
```
This runs the full agent loop (Profiler $\rightarrow$ Paraphraser $\rightarrow$ Critic validation pass $\rightarrow$ loop correction $\rightarrow$ approval) and displays the execution log directly on the terminal.

---

## 🔌 Model Context Protocol (MCP) Server

The project includes a built-in MCP server that implements a tool to retrieve replacement patterns.

*   **Location:** [mcp-server/index.js](file:///workspaces/agentic-humanizer/mcp-server/index.js)
*   **Command to execute:** `node mcp-server/index.js`
*   **Tool:** `get_humanizer_patterns`
    *   **Arguments:** `{"tone": "casual" | "formal" | "balanced"}` (Strict Zod validation)

---

## 🌐 Local HTTP Router API

The GUI server exposes the following local endpoints:

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

## 🐳 Docker Deployment
The service is optimized for single-stage Docker runtimes:
*   **Build command:** `docker build -t agentic-humanizer .`
*   **Execution command:** `docker run -p 3000:3000 -e HUGGINGFACEHUB_API_TOKEN="<your_token>" agentic-humanizer`
