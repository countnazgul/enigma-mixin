import EventEmitter from "node-event-emitter";

function getTimestamp() {
  const pad = (n, s = 2) => `${new Array(s).fill(0)}${n}`.slice(-s);
  const d = new Date();

  return `${pad(d.getFullYear(), 4)}-${pad(d.getMonth() + 1)}-${pad(
    d.getDate()
  )} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export function mGetReloadProgress(qRequestId?: number) {
  const _this: EngineAPI.IGlobal = this;
  const emitter = new EventEmitter();

  let reloaded = false;

  const messageCodes = {
    undefined: "UNKNOWN MESSAGE CODE! ",
    0: "",
    1: "Saving state and data",
    2: " Bytes left for column id: ",
    3: " Now storing table: ",
    4: " Rows fetched so far: ",
    5: " Connected",
    6: " Connected to ",
    7: " Failed to connect",
    8: " (QVD (row-based) optimized) ",
    9: " (QVD columnar optimized)",
    10: "Script error:\n",
    11: " Done",
    12: "",
    13: "Columnar QVD file detected. Use STORE INTO to optimize and make this file row-based.",
    14: " Loading QVC file: ",
    15: " (buffered)",
    16: " preparing",
    17: " appending",
    18: " Removing synthetic ",
    19: " (fetching)",
    20: " Reloading: ",
    21: " Lines fetched: ",
    22: "Creating search index ",
    23: "Indexing field: ",
    24: "Search index creation completed successfully",
    25: "The search index is incomplete. Smart Search might be slower than expected.",
    26: "Canceling creation of search index",
    27: "Canceled creation of search index. Smart Search might be slower than expected.",
    28: "The search index is incomplete: timed out. Smart Search might be slower than expected.",
    29: "he search index is incomplete: not enough memory. Smart Search might be slower than expected.",
    30: "Access was denied after reload. Check that the user that reloads the script is included in the section access part of the script.",
  };

  return {
    emitter,
    start(options?: {
      poolInterval?: number;
      skipTransientMessages?: boolean;
      includeTimeStamp?: boolean;
      trimLeadingMessage?: boolean;
    }) {
      const defaultOptions = {
        poolInterval: 200,
        skipTransientMessages: false,
        includeTimeStamp: false,
        trimLeadingMessage: false,
      };

      const optionsMerged = { ...defaultOptions, ...options };

      const progress = setInterval(function () {
        if (reloaded != true) {
          _this.getProgress(qRequestId ?? -1).then(function (msg) {
            if (msg.qPersistentProgressMessages) {
              msg.qPersistentProgressMessages.map((m) => {
                let message = options.trimLeadingMessage
                  ? messageCodes[m.qMessageCode].trimStart()
                  : messageCodes[m.qMessageCode];

                if (options.includeTimeStamp)
                  message = `${getTimestamp()} ${message}`;

                emitter.emit(
                  "progress",
                  `${message}${m.qMessageParameters[0] ?? ""}`
                );
              });
            }

            if (msg.qTransientProgressMessage && msg.qTransientProgress) {
              if (!options.skipTransientMessages) {
                let message =
                  msg.qTransientProgressMessage.qMessageParameters[0] ?? "";

                if (options.includeTimeStamp)
                  message = `${getTimestamp()} ${message}`;

                emitter.emit("progress", `${message}`);
              }
            }

            if (msg.qErrorData.length > 0) {
              const errorString = msg.qErrorData
                .map((qed) => qed.qErrorString)
                .join("\n");

              emitter.emit("progress", `${errorString}`);
              emitter.emit("error", `${errorString}`);
            }
          });
        } else {
          clearInterval(progress);
        }
      }, optionsMerged.poolInterval);
    },
    stop() {
      reloaded = true;
    },
  };
}
