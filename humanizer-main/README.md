# AI Humanize GUI
---
A local GUI app to rewrite AI-generated text into more natural, human-like writing.

For a detailed technical analysis of the execution lifecycle, local pipeline architecture, and design patterns, read the [Architectural Blueprint & Technical Breakdown](./architectural_breakdown.md).

deployed at https://ai-humanizer-1n0f.onrender.com/
---
# Table of Contents
1. [Codebase Architecture](./architectural_breakdown.md)
2. [Key Features](#-key-features)
3. [Prerequisites](#prerequisites)
4. [Quick Start](#quick-start)
5. [Install](#install)
6. [Run](#run)
7. [GUI Usage](#gui-usage)
8. [Local API](#local-api)
9. [Notes](#notes)

---

## ✨ Key Features

- 👤 **Hybrid Text Rewriter** - uses a massive local pattern library and sentence-splitting logic
- 🚀 **AI Pro Mode** - optional semantic rewriting via external AI for high-quality results
- 🖥️ **Terminal GUI** - retro-futuristic interface with theme support and live byte counting
- ⚡ **Fast Local Processing** - default rule-based engine runs instantly and privately


## Prerequisites
- Node.js >= 16

## Quick Start

```bash
npm install
npm run build
npm run start
```

## Install
1. Clone this repository
2. Install dependencies (uses public registry by default via `.npmrc`)
```bash
npm install
```
3. Build the project
```bash
npm run build
```

## Run

Run the server:

```bash
npm run start
```

Open `http://localhost:3000` in your browser.

## GUI Usage

1. Run:

```bash
npm run start
```

2. Open `http://localhost:3000`
3. Paste text
4. Choose tone (`balanced`, `casual`, `formal`)
5. Click **Humanize text**
6. Copy the output

## Deployment

### Deploy to Render

This project is optimized for [Render](https://render.com/).

1. **Connect GitHub:** Link your repository to a new **Web Service**.
2. **Runtime:** Select **Docker**.
3. **Port:** The app automatically detects the `PORT` environment variable (defaulting to 3000).
4. **Auto-Start:** The `Dockerfile` is pre-configured to launch the GUI mode on deployment.

---

## Local API

The GUI server also exposes local endpoints:

- `GET /health` -> returns `{ "ok": true }`
- `POST /api/humanize` -> humanizes text

Example request:

```bash
curl -s -X POST http://localhost:3000/api/humanize \
	-H 'Content-Type: application/json' \
	--data '{"text":"In order to optimize this process, we should leverage a better workflow.","style":"balanced"}'
```

## Notes

- The rewriting engine is local and rule-based.
- No Claude Desktop setup is required.
