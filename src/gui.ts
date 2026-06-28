import http from "node:http";
import { URL } from "node:url";

import { z } from "zod";

import { humanizeText, type HumanizeRequest } from "./humanize.js";
import { logger, LogLevel } from "./logger.js";
import { ValidationError, ProcessingError, NetworkError } from "./errors.js";

const GuiRequestSchema = z.object({
  text: z.string().min(1),
  style: z.enum(["balanced", "casual", "formal", "professional", "technical", "creative"]).optional(),
  proMode: z.boolean().optional(),
});

function renderPage(): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>HUMANIZER_STUDIO_V1.0</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;700&display=swap" rel="stylesheet">
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          fontFamily: {
            mono: ['"Fira Code"', 'monospace'],
          },
        },
      },
    }
  </script>
  <style>
    :root {
      --neon-green: #166534;
      --neon-cyan: #0369a1;
      --deep-black: #f8fafc;
      --terminal-gray: #e2e8f0;
      --glow-color: rgba(22, 101, 52, 0.2);
    }

    .dark {
      --neon-green: #00ff41;
      --neon-cyan: #0df;
      --deep-black: #050505;
      --terminal-gray: #1a1a1a;
      --glow-color: rgba(0, 255, 65, 0.5);
    }

    body {
      background-color: var(--deep-black);
      color: var(--neon-green);
      font-family: 'Fira Code', monospace;
      background-image: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.05) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.02), rgba(0, 255, 0, 0.01), rgba(0, 0, 255, 0.02));
      background-size: 100% 2px, 3px 100%;
      transition: background-color 0.3s, color 0.3s;
    }

    .dark body {
      background-image: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06));
    }

    .crt-glow {
      text-shadow: 0 0 5px var(--glow-color), 0 0 10px rgba(0, 255, 65, 0.1);
    }

    .terminal-border {
      border: 1px solid var(--neon-green);
      box-shadow: 0 0 10px var(--glow-color);
    }

    .tone-flag.active {
      background-color: var(--neon-green);
      color: var(--deep-black);
      box-shadow: 0 0 10px var(--neon-green);
    }

    .pro-toggle.active {
      border-color: #f59e0b;
      color: #f59e0b;
      box-shadow: 0 0 10px rgba(245, 158, 11, 0.4);
    }

    textarea {
      caret-color: var(--neon-green);
      color: var(--neon-green);
    }

    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: var(--deep-black); }
    ::-webkit-scrollbar-thumb { background: var(--neon-green); }

    .scanline {
      width: 100%;
      height: 100px;
      z-index: 10;
      background: linear-gradient(0deg, rgba(0, 0, 0, 0) 0%, rgba(0, 255, 65, 0.05) 50%, rgba(0, 0, 0, 0) 100%);
      opacity: 0.1;
      position: absolute;
      bottom: 100%;
      animation: scanline 10s linear infinite;
    }

    @keyframes scanline {
      0% { bottom: 100%; }
      100% { bottom: -100px; }
    }

    .cursor {
      display: inline-block;
      width: 10px;
      height: 1.2em;
      background-color: var(--neon-green);
      vertical-align: middle;
      animation: blink 1s step-end infinite;
    }

    @keyframes blink {
      50% { opacity: 0; }
    }
  </style>
  <script>
    if (localStorage.getItem('color-theme') === 'dark' || (!('color-theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark')
    }
  </script>
</head>
<body class="p-4 md:p-8 min-h-screen overflow-x-hidden relative">
  <div class="scanline pointer-events-none"></div>

  <div class="max-w-6xl mx-auto space-y-8 relative z-20">
    <!-- ASCII Banner -->
    <header class="flex flex-col md:flex-row md:items-end justify-between gap-6 crt-glow">
      <div>
        <pre class="text-[10px] md:text-xs leading-none mb-4 opacity-80 hidden md:block select-none pointer-events-none">
 █████╗ ██╗     ██╗  ██╗██╗   ██╗███╗   ███╗ █████╗ ███╗   ██╗██╗███████╗███████╗██████╗ 
██╔══██╗██║     ██║  ██║██║   ██║████╗ ████║██╔══██╗████╗  ██║██║╚══███╔╝██╔════╝██╔══██╗
███████║██║     ███████║██║   ██║██╔████╔██║███████║██╔██╗ ██║██║  ███╔╝ █████╗  ██████╔╝
██╔══██║██║     ██╔══██║██║   ██║██║╚██╔╝██║██╔══██║██║╚██╗██║██║ ███╔╝  ██╔══╝  ██╔══██╗
██║  ██║██║     ██║  ██║╚██████╔╝██║ ╚═╝ ██║██║  ██║██║ ╚████║██║███████╗███████╗██║  ██║
╚═╝  ╚═╝╚═╝     ╚═╝  ╚═╝ ╚═════╝ ╚═╝     ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝╚══════╝╚══════╝╚═╝  ╚═╝
        </pre>
        <div class="flex items-center space-x-2 text-xs font-bold uppercase tracking-[0.2em]">
          <span>[ SYSTEM ONLINE ]</span>
          <span class="text-slate-500 dark:text-white">v1.1.0-HYBRID</span>
        </div>
      </div>
      
      <div class="flex items-center space-x-4">
        <button id="pro-toggle" class="pro-toggle terminal-border px-4 py-2 text-[10px] uppercase font-bold tracking-widest transition-all">
          <span id="pro-toggle-text">[ PRO_MODE: OFF ]</span>
        </button>
        <button id="theme-toggle" class="terminal-border px-4 py-2 text-[10px] uppercase font-bold tracking-widest hover:bg-white/5 transition-all">
          <span id="theme-toggle-text">[ THEME_SWITCH ]</span>
        </button>
      </div>
    </header>

    <main class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- INPUT PORT -->
      <section class="space-y-4">
        <div class="flex items-center justify-between px-2">
          <span class="text-xs font-bold uppercase tracking-widest text-cyan-700 dark:text-cyan-400"># INPUT_PORT_01</span>
          <span id="char-count" class="text-xs opacity-60">0x0 BYTES</span>
        </div>
        
        <div class="terminal-border bg-black/[0.03] dark:bg-black/40 backdrop-blur-sm p-4 h-[400px] md:h-[500px] flex flex-col">
          <textarea id="input" 
            class="flex-1 bg-transparent border-none outline-none resize-none text-sm leading-relaxed placeholder:opacity-30 scrollbar-hide"
            placeholder="[ ENTER DATA TO BE RE-PHRASED ]"></textarea>
          <div class="mt-2 text-xs opacity-50 border-t border-current pt-2 flex justify-between">
            <span>[ STATUS: WAITING_FOR_INPUT ]</span>
            <span>UTF-8</span>
          </div>
        </div>

        <div class="space-y-6">
          <div class="space-y-3">
            <span class="text-xs font-bold uppercase tracking-widest text-cyan-700 dark:text-cyan-400 block px-2"># PARAM_SELECT [TONE]</span>
            <div id="tone-selector" class="flex flex-wrap gap-2 text-[10px] md:text-xs">
              <button data-tone="balanced" class="tone-flag active px-3 py-1 border border-current transition-all uppercase">--balanced</button>
              <button data-tone="casual" class="tone-flag px-3 py-1 border border-current transition-all uppercase">--casual</button>
              <button data-tone="formal" class="tone-flag px-3 py-1 border border-current transition-all uppercase">--formal</button>
              <button data-tone="professional" class="tone-flag px-3 py-1 border border-current transition-all uppercase">--professional</button>
              <button data-tone="technical" class="tone-flag px-3 py-1 border border-current transition-all uppercase">--technical</button>
              <button data-tone="creative" class="tone-flag px-3 py-1 border border-current transition-all uppercase">--creative</button>
            </div>
          </div>

          <div class="flex items-center space-x-4 pt-2">
            <button id="humanize" class="flex-1 terminal-border bg-current/5 hover:bg-current/10 font-bold py-3 uppercase tracking-widest transition-all active:scale-[0.98] disabled:opacity-30">
              <span id="button-text">> RUN HUMANIZER_PROTOCOL</span>
            </button>
            <button id="sample" class="terminal-border bg-transparent hover:bg-current/5 px-6 py-3 uppercase text-xs transition-all">
              [ SAMPLE ]
            </button>
          </div>
        </div>
      </section>

      <!-- OUTPUT PORT -->
      <section class="space-y-4">
        <div class="flex items-center justify-between px-2">
          <span class="text-xs font-bold uppercase tracking-widest text-cyan-700 dark:text-cyan-400"># OUTPUT_PORT_01</span>
          <button id="copy" class="text-xs hover:opacity-100 transition-colors flex items-center space-x-2">
            <span>[ COPY_TO_BUFFER ]</span>
          </button>
        </div>

        <div id="output-container" class="terminal-border bg-black/[0.05] dark:bg-black/60 p-6 h-[300px] md:h-[400px] overflow-y-auto relative scrollbar-thin">
          <div id="output-placeholder" class="opacity-30 text-xs italic">
            [ SYSTEM: STDOUT_EMPTY ]
            <br>AWAITING EXECUTION...
          </div>
          <div id="output" class="hidden text-sm leading-relaxed whitespace-pre-wrap"></div>
        </div>

        <div class="space-y-4">
          <span class="text-xs font-bold uppercase tracking-widest text-cyan-700 dark:text-cyan-400 block px-2"># EXECUTION_LOG</span>
          <div id="changes-container" class="terminal-border bg-black/[0.03] dark:bg-black/40 p-4 min-h-[120px] max-h-[200px] overflow-y-auto text-[10px] md:text-xs">
            <div id="changes-placeholder" class="opacity-30">LOG_EMPTY</div>
            <ul id="changes-list" class="hidden space-y-1"></ul>
          </div>
          <div id="status" class="text-[10px] uppercase opacity-60 px-2 animate-pulse">> SYS_READY</div>
        </div>
      </section>
    </main>
  </div>

  <!-- Toast -->
  <div id="toast" class="fixed top-4 right-4 terminal-border bg-white dark:bg-black px-4 py-2 text-[10px] uppercase font-bold tracking-widest opacity-0 translate-x-12 transition-all duration-300 pointer-events-none z-50">
    <span class="text-cyan-700 dark:text-cyan-400">NOTIF:</span> <span id="toast-text"></span>
  </div>

  <script>
    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeToggleText = document.getElementById('theme-toggle-text');
    const proToggleBtn = document.getElementById('pro-toggle');
    const proToggleText = document.getElementById('pro-toggle-text');

    let proMode = false;

    proToggleBtn.addEventListener('click', () => {
      proMode = !proMode;
      proToggleBtn.classList.toggle('active');
      proToggleText.textContent = proMode ? '[ PRO_MODE: ON ]' : '[ PRO_MODE: OFF ]';
      status.textContent = proMode ? '> ENGINE_SWITCH: SEMANTIC_AI_ACTIVE' : '> ENGINE_SWITCH: LOCAL_RULES_ACTIVE';
      showToast(proMode ? 'PRO_MODE_ENABLED' : 'PRO_MODE_DISABLED');
    });

    function updateThemeToggleText() {
      if (document.documentElement.classList.contains('dark')) {
        themeToggleText.textContent = '[ THEME: LIGHT_MODE ]';
      } else {
        themeToggleText.textContent = '[ THEME: DARK_MODE ]';
      }
    }
    updateThemeToggleText();

    themeToggleBtn.addEventListener('click', function() {
        if (document.documentElement.classList.contains('dark')) {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('color-theme', 'light');
        } else {
            document.documentElement.classList.add('dark');
            localStorage.setItem('color-theme', 'dark');
        }
        updateThemeToggleText();
    });

    const input = document.getElementById('input');
    const charCount = document.getElementById('char-count');
    const humanizeButton = document.getElementById('humanize');
    const sampleButton = document.getElementById('sample');
    const copyButton = document.getElementById('copy');
    const status = document.getElementById('status');
    const output = document.getElementById('output');
    const outputPlaceholder = document.getElementById('output-placeholder');
    const changesList = document.getElementById('changes-list');
    const changesPlaceholder = document.getElementById('changes-placeholder');
    const toneButtons = document.querySelectorAll('.tone-flag');
    const buttonText = document.getElementById('button-text');
    const toast = document.getElementById('toast');
    const toastText = document.getElementById('toast-text');

    let currentStyle = 'balanced';

    // Tone selection
    toneButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        toneButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentStyle = btn.dataset.tone;
        status.textContent = \`> TONE_SET_TO: \${currentStyle.toUpperCase()}\`;
      });
    });

    // Character count
    input.addEventListener('input', () => {
      const length = input.value.length;
      charCount.textContent = \`0x\${length.toString(16).toUpperCase()} BYTES\`;
    });

    const sampleText = 'In order to optimize the workflow, it is important to note that teams should leverage efficient processes and therefore improve consistency across the board. Additionally, the final result should feel natural and readable.';

    sampleButton.addEventListener('click', () => {
      input.value = sampleText;
      input.dispatchEvent(new Event('input'));
      showToast('SAMPLE_LOADED');
    });

    function showToast(message) {
      toastText.textContent = message;
      toast.classList.remove('opacity-0', 'translate-x-12');
      toast.classList.add('opacity-100', 'translate-x-0');
      setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-x-12');
        toast.classList.remove('opacity-100', 'translate-x-0');
      }, 3000);
    }

    copyButton.addEventListener('click', async () => {
      const text = output.textContent || '';
      if (!text) return;
      try {
        await navigator.clipboard.writeText(text);
        showToast('BUFFER_COPIED');
      } catch (err) {
        showToast('ERR:BUFFER_FAIL');
      }
    });

    function typeWriter(text, i, fnCallback) {
      if (i < text.length) {
        output.textContent = text.substring(0, i + 1);
        output.scrollTop = output.scrollHeight;
        setTimeout(() => typeWriter(text, i + 1, fnCallback), 10);
      } else if (typeof fnCallback == 'function') {
        fnCallback();
      }
    }

    humanizeButton.addEventListener('click', async () => {
      const text = input.value.trim();
      if (!text) {
        showToast('ERR:INPUT_REQUIRED');
        return;
      }

      humanizeButton.disabled = true;
      buttonText.textContent = '> EXECUTING_PROTOCOL...';
      status.textContent = proMode ? '> PROTOCOL: UPLINKING_TO_AI_CORES...' : '> PROTOCOL: INITIALIZING_ENGINE...';

      try {
        const response = await fetch('/api/humanize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, style: currentStyle, proMode })
        });

        if (!response.ok) throw new Error('FAIL_CODE_01');

        const data = await response.json();
        
        output.classList.remove('hidden');
        outputPlaceholder.classList.add('hidden');
        output.textContent = '';
        
        status.textContent = '> PROTOCOL: STREAMING_OUTPUT...';
        
        typeWriter(data.humanizedText, 0, () => {
          changesList.innerHTML = '';
          if (data.changes && data.changes.length > 0) {
            data.changes.forEach(change => {
              const li = document.createElement('li');
              li.className = 'flex items-start space-x-2 opacity-70';
              li.innerHTML = \`<span class="text-cyan-700 dark:text-cyan-400 mt-0.5 font-bold">[+]</span><span>\${change.toUpperCase()}</span>\`;
              changesList.appendChild(li);
            });
            changesList.classList.remove('hidden');
            changesPlaceholder.classList.add('hidden');
          } else {
            changesList.classList.add('hidden');
            changesPlaceholder.classList.remove('hidden');
            changesPlaceholder.textContent = 'NO_CHANGES_DETECTED';
          }
          status.textContent = '> SYS_READY';
          showToast(data.proMode ? 'PRO_PROTOCOL_SUCCESS' : 'LOCAL_PROTOCOL_SUCCESS');
        });

      } catch (error) {
        status.textContent = 'ERR: ' + error.message;
        showToast('FATAL_EXCEPTION');
      } finally {
        humanizeButton.disabled = false;
        buttonText.textContent = '> RUN HUMANIZER_PROTOCOL';
      }
    });

    // Ctrl+Enter to humanize
    input.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        humanizeButton.click();
      }
    });
  </script>
</body>
</html>`;
}

async function readJsonBody(request: http.IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];

  for await (const chunk of request) {
    chunks.push(Buffer.from(chunk));
  }

  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

function sendJson(response: http.ServerResponse, statusCode: number, payload: unknown): void {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  response.end(JSON.stringify(payload));
}

export async function startGuiServer(port: number): Promise<http.Server> {
  const server = http.createServer(async (request, response) => {
    if (!request.url) {
      response.writeHead(400);
      response.end("Bad request");
      return;
    }

    const url = new URL(request.url, `http://${request.headers.host ?? "localhost"}`);

    if (request.method === "GET" && (url.pathname === "/" || url.pathname === "/index.html")) {
      response.writeHead(200, {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
      });
      response.end(renderPage());
      return;
    }

    if (request.method === "GET" && url.pathname === "/health") {
      sendJson(response, 200, { ok: true });
      return;
    }

    if (request.method === "POST" && url.pathname === "/api/humanize") {
      try {
        const body = GuiRequestSchema.parse(await readJsonBody(request));

        if (!body.text || body.text.trim().length === 0) {
          throw new ValidationError("Text cannot be empty", "text");
        }

        if (body.text.length > 10000) {
          throw new ValidationError("Text is too long (maximum 10,000 characters)", "text");
        }

        if (body.style && !["balanced", "casual", "formal", "professional", "technical", "creative"].includes(body.style)) {
          throw new ValidationError("Invalid style specified", "style");
        }

        logger.info("Processing humanize request", {
          textLength: body.text.length,
          style: body.style || "balanced",
          proMode: !!body.proMode
        });

        let result;
        if (body.proMode) {
          const humanizeUrl = "https://api.edgeshop.ai/rewrite/humanize";
          const proResult = await (async () => {
             // Re-using the makeRequest-like logic directly here or we could export it
             // For simplicity, we'll call the humanizeText engine as fallback if fetch fails
             try {
               const response = await fetch(humanizeUrl, {
                 method: 'POST',
                 headers: { 'Content-Type': 'application/json' },
                 body: JSON.stringify({ text: body.text, style: body.style || "balanced" })
               });
               if (response.ok) return await response.json();
             } catch (e) {
               logger.error("Failed to fetch pro humanization", { error: e });
             }
             return null;
          })();

          if (proResult && proResult.humanizedText) {
            result = {
              originalText: body.text,
              humanizedText: proResult.humanizedText,
              style: body.style || "balanced",
              changes: ["AI Semantic Rewriting Applied"],
              proMode: true
            };
          }
        }

        if (!result) {
          result = humanizeText(body as HumanizeRequest);
        }

        logger.info("Successfully processed humanize request", {
          originalLength: result.originalText.length,
          humanizedLength: result.humanizedText.length,
          changesCount: result.changes.length,
          proMode: !!(result as any).proMode
        });

        sendJson(response, 200, result);
      } catch (error) {
        logger.error("Error processing humanize request", { error });

        if (error instanceof z.ZodError) {
          const message = error.errors
            .map((e) => `${e.path.join(".")}: ${e.message}`)
            .join(", ");
          sendJson(response, 400, {
            error: "Invalid request format",
            details: message,
          });
        } else if (error instanceof ValidationError) {
          sendJson(response, 400, {
            error: error.message,
            field: error.field,
          });
        } else if (error instanceof ProcessingError) {
          sendJson(response, 500, {
            error: "Failed to process text",
            details: error.message,
          });
        } else {
          sendJson(response, 500, {
            error: "An unexpected error occurred",
            details: error instanceof Error ? error.message : "Unknown error",
          });
        }
      }
      return;
    }

    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
  });

  await new Promise<void>((resolve) => {
    server.listen(port, resolve);
  });

  return server;
}

export const defaultGuiPort = parseInt(process.env.PORT || "3000", 10);
