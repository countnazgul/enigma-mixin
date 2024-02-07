import EventEmitter from "node-event-emitter";

export function mGetReloadProgress(qRequestId?: number) {
  const _this: EngineAPI.IGlobal = this;
  const emitter = new EventEmitter();

  let reloaded = false;

  const errorCodes = {
    undefined: "UNDEFINED MESSAGE CODE! ",
    0: "",
    10: "The following error occurred:\n",
    21: " Lines fetched: ",
  };

  return {
    emitter,
    start(options?: {
      poolInterval?: number;
      skipTransientMessages?: boolean;
      includeTimeStamp?: boolean;
    }) {
      const defaultOptions = {
        poolInterval: 200,
        skipTransientMessages: false,
        includeTimeStamp: false,
      };

      const optionsMerged = { ...defaultOptions, ...options };

      const progress = setInterval(function () {
        if (reloaded != true) {
          _this.getProgress(qRequestId ?? -1).then(function (msg) {
            if (msg.qPersistentProgressMessages) {
              msg.qPersistentProgressMessages.map((m) => {
                emitter.emit(
                  "progress",
                  `${errorCodes[m.qMessageCode]}${m.qMessageParameters[0]}`
                );
              });
            }

            if (msg.qTransientProgressMessage && msg.qTransientProgress) {
              if (!options.skipTransientMessages)
                emitter.emit(
                  "progress",
                  `${msg.qTransientProgressMessage.qMessageParameters[0]}`
                );
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
