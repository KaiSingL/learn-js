import { formatValue } from "./format.js";

const RUN_ID = () => "run-" + Math.random().toString(36).slice(2) + "-" + Date.now().toString(36);

function jsonForScript(value) {
  return JSON.stringify(value).replace(/</g, "\\u003c").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
}

// ---------------------------------------------------------------------------
// Worker runner: the default. A worker has its own thread, so a synchronous
// infinite loop can be terminated instead of freezing the page.
// ---------------------------------------------------------------------------

const WORKER_SOURCE = `
var formatValue = ${formatValue.toString()};
var formatArgs = function (args) {
  var parts = [];
  for (var i = 0; i < args.length; i = i + 1) {
    parts[parts.length] = formatValue(args[i], 0, []);
  }
  return parts.join(" ");
};

var nativeSetTimeout = self.setTimeout.bind(self);
var nativeClearTimeout = self.clearTimeout.bind(self);
var nativeSetInterval = self.setInterval.bind(self);
var nativeClearInterval = self.clearInterval.bind(self);

var finished = false;
var pendingTimeouts = 0;
var idleTimer = null;
var liveTimeouts = {};

function send(type, payload) {
  self.postMessage({ type: type, payload: payload });
}

function describe(err) {
  if (err === null || err === undefined) return String(err);
  if (err && typeof err === "object" && typeof err.message === "string") {
    var name = err.name || "Error";
    return name + ": " + err.message;
  }
  return formatValue(err, 1);
}

function report(err) {
  send("error", describe(err));
}

function finish() {
  if (finished) return;
  finished = true;
  if (idleTimer !== null) nativeClearTimeout(idleTimer);
  send("done", {});
}

function armIdle() {
  if (finished) return;
  if (pendingTimeouts > 0) return;
  if (idleTimer !== null) nativeClearTimeout(idleTimer);
  idleTimer = nativeSetTimeout(function () {
    if (pendingTimeouts > 0) return;
    finish();
  }, 150);
}

function timedSetTimeout(fn, ms) {
  var extra = Array.prototype.slice.call(arguments, 2);
  var id = nativeSetTimeout(function () {
    delete liveTimeouts[id];
    pendingTimeouts = pendingTimeouts - 1;
    try {
      if (typeof fn === "function") fn.apply(null, extra);
      else if (typeof fn === "string") self.eval(fn);
    } catch (err) {
      report(err);
    }
    armIdle();
  }, ms);
  liveTimeouts[id] = true;
  pendingTimeouts = pendingTimeouts + 1;
  return id;
}

function timedClearTimeout(id) {
  if (liveTimeouts[id]) {
    delete liveTimeouts[id];
    pendingTimeouts = pendingTimeouts - 1;
  }
  return nativeClearTimeout(id);
}

function timedSetInterval(fn, ms) {
  var extra = Array.prototype.slice.call(arguments, 2);
  return nativeSetInterval(function () {
    try {
      if (typeof fn === "function") fn.apply(null, extra);
    } catch (err) {
      report(err);
    }
  }, ms);
}

function timedClearInterval(id) {
  return nativeClearInterval(id);
}

var consoleShim = {
  log: function () { send("log", formatArgs(Array.prototype.slice.call(arguments))); },
  info: function () { send("log", formatArgs(Array.prototype.slice.call(arguments))); },
  debug: function () { send("log", formatArgs(Array.prototype.slice.call(arguments))); },
  dir: function () { send("log", formatArgs(Array.prototype.slice.call(arguments))); },
  table: function () { send("log", formatArgs(Array.prototype.slice.call(arguments))); },
  warn: function () { send("warn", formatArgs(Array.prototype.slice.call(arguments))); },
  error: function () { send("error", formatArgs(Array.prototype.slice.call(arguments))); }
};

function execute(code) {
  var console = consoleShim;
  var setTimeout = timedSetTimeout;
  var clearTimeout = timedClearTimeout;
  var setInterval = timedSetInterval;
  var clearInterval = timedClearInterval;
  return eval(code);
}

self.addEventListener("unhandledrejection", function (event) {
  report(event.reason);
});

self.onmessage = function (event) {
  var code = event.data.code;

  var result;
  try {
    result = execute(code);
  } catch (err) {
    report(err);
    finish();
    return;
  }

  if (result && typeof result.then === "function") {
    result.then(
      function (value) {
        if (value !== undefined) send("result", formatValue(value, 1));
        finish();
      },
      function (err) {
        report(err);
        finish();
      }
    );
    return;
  }

  if (result !== undefined) send("result", formatValue(result, 1));
  armIdle();
};
`;

export function runInWorker(options) {
  const { code, timeout = 2200, onEvent } = options;
  let worker = null;
  let url = null;
  let timer = null;
  let settled = false;

  function cleanup() {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
    if (worker) {
      worker.terminate();
      worker = null;
    }
    if (url) {
      URL.revokeObjectURL(url);
      url = null;
    }
  }

  function finish(status) {
    if (settled) return;
    settled = true;
    cleanup();
    onEvent({ type: "done", ...status });
  }

  const blob = new Blob([WORKER_SOURCE], { type: "text/javascript" });
  url = URL.createObjectURL(blob);
  worker = new Worker(url);

  worker.onmessage = (event) => {
    if (settled) return;
    const data = event.data || {};
    if (data.type === "done") {
      finish({ timedOut: false, fallback: false });
      return;
    }
    onEvent(data);
  };

  worker.onerror = (event) => {
    if (settled) return;
    event.preventDefault();
    onEvent({
      type: "error",
      payload: event.message || "The sandbox worker crashed.",
    });
    finish({ timedOut: false, fallback: false });
  };

  try {
    worker.postMessage({ code });
  } catch (err) {
    onEvent({ type: "error", payload: "Could not start the sandbox: " + err.message });
    finish({ timedOut: false, fallback: false });
    return { cancel: () => {} };
  }

  timer = setTimeout(() => {
    finish({ timedOut: true, fallback: false });
  }, timeout);

  return {
    cancel() {
      finish({ cancelled: true, fallback: false });
    },
  };
}

// ---------------------------------------------------------------------------
// Iframe runner: used for the visible preview, and as a fallback when workers
// are unavailable (for example when the single-file build is opened from
// file:// in a browser that blocks blob workers). It has DOM access, but a
// synchronous loop in it cannot be interrupted.
// ---------------------------------------------------------------------------

const PREVIEW_STYLE = `
  * { box-sizing: border-box; }
  html, body { margin: 0; }
  body {
    background: #0e0e10;
    color: #eaeaea;
    font: 13px/1.6 "JetBrains Mono", ui-monospace, monospace;
    padding: 14px;
    overflow-wrap: break-word;
  }
  button {
    font: inherit;
    background: #ffc52c;
    color: #000;
    border: 0;
    border-radius: 6px;
    padding: 6px 12px;
    font-weight: 700;
    cursor: pointer;
  }
  button:hover { background: #ffd45c; }
  input {
    font: inherit;
    background: #17171a;
    color: #eaeaea;
    border: 1px solid #26262b;
    border-radius: 6px;
    padding: 6px 10px;
  }
  .row { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
  .value {
    font-size: 28px;
    font-weight: 700;
    color: #ffc52c;
    min-width: 2ch;
  }
  .muted { color: #9a9aa0; }
  #app:empty::after {
    content: "Preview is empty — build something with document.createElement.";
    color: #9a9aa0;
  }
`;

export function runInIframe(options) {
  const { code, html = "", onEvent, container } = options;
  const runId = RUN_ID();
  const iframe = document.createElement("iframe");
  iframe.setAttribute("sandbox", "allow-scripts");
  iframe.setAttribute("title", "Code preview");
  iframe.style.width = "100%";
  iframe.style.height = "100%";
  iframe.style.border = "0";
  iframe.style.display = "block";
  iframe.style.background = "#0e0e10";

  const bootstrap = `
(function () {
  var RUN_ID = ${jsonForScript(runId)};
  var CODE = ${jsonForScript(code)};
  var send = function (type, payload) {
    parent.postMessage({ __realjs: true, runId: RUN_ID, type: type, payload: payload }, "*");
  };
  var formatValue = ${formatValue.toString()};
  var formatArgs = function (args) {
    var parts = [];
    for (var i = 0; i < args.length; i = i + 1) {
      parts[parts.length] = formatValue(args[i], 0, []);
    }
    return parts.join(" ");
  };

  function describe(err) {
    if (err === null || err === undefined) return String(err);
    if (err && typeof err === "object" && typeof err.message === "string") {
      return (err.name || "Error") + ": " + err.message;
    }
    return formatValue(err, 1);
  }

  var consoleShim = {
    log: function () { send("log", formatArgs(Array.prototype.slice.call(arguments))); },
    info: function () { send("log", formatArgs(Array.prototype.slice.call(arguments))); },
    debug: function () { send("log", formatArgs(Array.prototype.slice.call(arguments))); },
    dir: function () { send("log", formatArgs(Array.prototype.slice.call(arguments))); },
    table: function () { send("log", formatArgs(Array.prototype.slice.call(arguments))); },
    warn: function () { send("warn", formatArgs(Array.prototype.slice.call(arguments))); },
    error: function () { send("error", formatArgs(Array.prototype.slice.call(arguments))); }
  };

  window.onerror = function (message, source, line, col, error) {
    send("error", describe(error || message));
    return true;
  };

  window.addEventListener("unhandledrejection", function (event) {
    send("error", describe(event.reason));
  });

  var started = Date.now();
  try {
    var result = eval(CODE);
    if (result && typeof result.then === "function") {
      result.then(
        function (value) {
          if (value !== undefined) send("result", formatValue(value, 1));
          send("done", {});
        },
        function (err) {
          send("error", describe(err));
          send("done", {});
        }
      );
    } else {
      if (result !== undefined) send("result", formatValue(result, 1));
      setTimeout(function () {
        send("done", { ms: Date.now() - started });
      }, 150);
    }
  } catch (err) {
    send("error", describe(err));
    send("done", {});
  }
})();
`;

  iframe.srcdoc =
    '<!doctype html><html><head><meta charset="utf-8">' +
    '<meta http-equiv="Content-Security-Policy" content="default-src \'none\'; style-src \'unsafe-inline\'; script-src \'unsafe-inline\' \'unsafe-eval\'">' +
    "<style>" +
    PREVIEW_STYLE +
    "</style></head><body>" +
    html +
    '<div id="app"></div>' +
    "<script>" +
    bootstrap.replace(/<\/script/gi, "<\\/script") +
    "</script></body></html>";

  let settled = false;
  function onMessage(event) {
    if (event.source !== iframe.contentWindow) return;
    const data = event.data;
    if (!data || data.__realjs !== true || data.runId !== runId) return;
    if (data.type === "done") {
      if (settled) return;
      settled = true;
      onEvent({ type: "done", timedOut: false, fallback: true });
      return;
    }
    onEvent(data);
  }

  window.addEventListener("message", onMessage);

  const host = container || document.body;
  host.appendChild(iframe);

  return {
    cancel() {
      window.removeEventListener("message", onMessage);
      if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
    },
    destroy() {
      window.removeEventListener("message", onMessage);
      if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
    },
    iframe,
  };
}
