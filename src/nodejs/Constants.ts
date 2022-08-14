const sources = ["assert", "async_context", "async_hooks", "buffer", "child_process", "cluster", "console", "crypto", "deprecations", "diagnostics_channel", "dns", "domain", "errors", "events", "fs", "http", "http2", "https", "inspector", "net", "os", "path", "perf_hooks", "process", "punycode", "querystring", "readline", "repl", "stream", "string_decoder", "test", "timers", "tls", "tracing", "tty", "dgram", "url", "util", "v8", "vm", "wasi", "webcrypto", "webstreams", "worker_threads", "zlib"];
const convert = { "asynchronous_context_tracking": "async_context" };

/*
Node.js documentation links structure:

    - https://nodejs.org/docs/{{VERSION}}/apilinks.json // ? Github source code links for one function
    - https://nodejs.org/docs/{{VERSION?}}/api/{{CLASSE}}.json // ? All data of one class of the documentation (e.g. "fs")
    - https://nodejs.org/docs/{{VERSION?}}/api/all.json // ? All data of the documentation

    VERSION = v10.16.0 (Don't recommanded, because a lot of error can appear with this method) | latest-v17.x | latest 

    Version cannot be less than v10.16.0 for apilinks.json
*/

export { sources, convert };