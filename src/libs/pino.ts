import pino from "pino";

const logger = pino({
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    bindings: () => {
      return {};
    },
    level: (label) => {
      return { level: label.toUpperCase() };
    },
  },
});

export { logger };
